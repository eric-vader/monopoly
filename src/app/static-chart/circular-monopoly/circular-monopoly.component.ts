import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'ngx-circular-monopoly',
  templateUrl: './circular-monopoly.component.html',
})
export class CircularMonopolyComponent implements OnInit {
  ngOnInit(): void {
    var probabilities1 = Array.from({ length: 40 }, () => Math.random());
    var probabilities2 = Array.from({ length: 40 }, () => Math.random());

    var propertyWidth = 220;
    var propertyHeight = 300;
    var propertyX = 600;
    var propertyY = 550;

    var minProbability = 0;
    var maxProbability = 0;

    var svg = d3.select("body")
      .append("svg")
      .attr("height", 3000)
      .attr("width", 3000)
      .attr("id", "drawhere")

    var property = d3.select("#drawhere")
      .append("rect")
      .attr("id", "property")
      .attr("height", propertyHeight)
      .attr("width", propertyWidth)
      .attr("x", propertyX)
      .attr("y", propertyY)
      .style("visibility", "hidden")
      .style("stroke", "black")
      .style("fill", "none");
    var propertyColour = d3.select("#drawhere")
      .append("rect")
      .attr("id", "propertyColour")
      .attr("height", propertyHeight / 10)
      .attr("width", propertyWidth)
      .attr("x", propertyX)
      .attr("y", propertyY)
      .style("visibility", "hidden")
      .style("stroke", "black")
      .style("fill", "none");
    var propertyName = d3.select("#drawhere")
      .append("text")
      .attr("id", "propertyName")
      .attr("x", propertyX + propertyWidth / 2)
      .attr("y", propertyY + 20)
      .attr("font-size", "1em")
      .attr("text-anchor", "middle")
      .style("visibility", "hidden");
    var propertyRents = d3.select("#drawhere")
      .append("text")
      .attr("id", "propertyRents")
      .attr("text-anchor", "middle")
      .attr("x", propertyX + propertyWidth / 2)
      .attr("y", propertyY + 40)
      .style("visibility", "hidden");
    var propertyStats = d3.select("#drawhere")
      .append("text")
      .attr("id", "propertyStats")
      .attr("text-anchor", "middle")
      .attr("x", propertyX + propertyWidth / 2)
      .attr("y", propertyY + propertyHeight - 50)
      .style("visibility", "hidden");

    function mouseOver(cardData) {
      propertyName.text(cardData.data["Name"]);
      propertyColour.style("fill", getColor(cardData)).style("opacity", 0.5);
      if (cardData.data["Rent"] != undefined) {
        propertyRents.append("tspan").text("Rent: " + cardData.data["Rent"][0]).attr("x", propertyX + propertyWidth / 2).attr("dy", 20);
      }
      if (cardData.data["Rent"] != undefined && cardData.data["Rent"].length > 1) {
        propertyRents.append("tspan").text("Rent with 1 House: " + cardData.data["Rent"][1]).attr("x", propertyX + propertyWidth / 2).attr("dy", 20);
      }
      if (cardData.data["Rent"] != undefined && cardData.data["Rent"].length > 2) {
        propertyRents.append("tspan").text("Rent with 2 Houses: " + cardData.data["Rent"][2]).attr("x", propertyX + propertyWidth / 2).attr("dy", 20);
      }
      if (cardData.data["Rent"] != undefined && cardData.data["Rent"].length > 3) {
        propertyRents.append("tspan").text("Rent with 3 Houses: " + cardData.data["Rent"][3]).attr("x", propertyX + propertyWidth / 2).attr("dy", 20);
      }
      if (cardData.data["Rent"] != undefined && cardData.data["Rent"].length > 4) {
        propertyRents.append("tspan").text("Rent with 4 Houses: " + cardData.data["Rent"][4]).attr("x", propertyX + propertyWidth / 2).attr("dy", 20);
      }
      if (cardData.data["Rent"] != undefined && cardData.data["Rent"].length > 5) {
        propertyRents.append("tspan").text("Rent with Hotel: " + cardData.data["Rent"][5]).attr("x", propertyX + propertyWidth / 2).attr("dy", 20);
      }
      propertyStats.append("tspan").text("Probability of landing: " + cardData.data["p_landings"].toFixed(3)).attr("x", propertyX + propertyWidth / 2).attr("dy", 20);
      propertyStats.append("tspan").text("Should you buy/build?: " + (cardData.data["recommendation"] <= 0 ? "No" : "Yes")).attr("x", propertyX + propertyWidth / 2).attr("dy", 20);
      propertyRents.style("visibility", "visible");
      propertyStats.style("visibility", "visible");
      propertyColour.style("visibility", "visible");
      propertyName.style("visibility", "visible");
      property.style("visibility", "visible");
    }

    function mouseOut(cardData) {
      propertyColour.style("visibility", "hidden");
      propertyName.style("visibility", "hidden");
      propertyRents.style("visibility", "hidden");
      propertyRents.selectAll("*").remove();
      propertyStats.style("visibility", "hidden");
      propertyStats.selectAll("*").remove();
      property.style("visibility", "hidden");
    }

    var line = d3.lineRadial()
      .angle(function (d) { return getAngle(d); })
      .radius(function (d) { return getRadius(d); });

    function isPurchaseableCard(card) {
      return card["Type"] == "Utility" || card["Type"] == "Railroad" || card["Type"] == "Street";
    }

    function getColor(cardData) {
      var color = cardData.data['Color'] ? cardData.data['Color']: "";
      if (color == "Brown (Dark Purple)") {
        color = "Brown";
      } else if (color == "Dark Blue") {
        color = "Indigo";
      } else if (color == "Light Blue") {
        color = "Blue";
      } else if (color == undefined || color.trim() == "") {
        color = "White";
      }
      return color;
    }

    function shouldBuy(cardData, donutNumber) {
      if (cardData.data["recommendation"] <= 0) {
        return d3.interpolateReds(1);
      }
      return d3.interpolateGreens(1);
    }

    function getHouses(cardData, donutNumber) {
      if (cardData.data["recommendation"] == 1) {
        return "../../../assets/files/one-home.svg";
      } if (cardData.data["recommendation"] == 2) {
        return "../../../assets/files/two-homes.svg";
      } if (cardData.data["recommendation"] == 3) {
        return "../../../assets/files/three-homes.svg";
      } if (cardData.data["recommendation"] == 4) {
        return "../../../assets/files/four-homes.svg";
      } else {
        return "";
      }
    }

    function getHotel(cardData, donutNumber) {
      if (cardData.data["recommendation"] == 5) {
        return "../../../assets/files/hotel.svg";
      } else {
        return "";
      }
    }

    function getProbability(cardData, donutNumber) {
      if (donutNumber == 1) {
        return probabilities1[parseInt(cardData.data["Square"])];
      } else {
        return probabilities2[parseInt(cardData.data["Square"])];
      }

    }

    function getAngle(cardData) {
      return 2 * Math.PI * parseInt(cardData.data["cardIndex"]) / 28;
    }

    function getRadius(cardData) {
      return (cardData.data["p_landings"] - minProbability) / (maxProbability - minProbability) * 250 + 150;
    }

    function createInnerDonut(svg, data_ready, innerRadius, outerRadius, donutNumber) {
      var arc = d3.arc()
        .outerRadius(outerRadius)
        .innerRadius(innerRadius);
      var houses = svg
        .selectAll('arc')
        .data(data_ready)
        .enter();
      houses
        .append('path')
        .attr('d', arc)
        .attr("transform", "translate(" + 710 + "," + 710 + ")")
        .attr('fill', function (d) { return shouldBuy(d, donutNumber); })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.5)
      houses
        .append("g")
        .attr("transform", function (d) {
          var _d = arc.centroid(d);
          _d[0] = _d[0] + 680;	//multiply by a constant factor
          _d[1] = _d[1] + 690;	//multiply by a constant factor
          return "translate(" + _d + ")";
        })
        .append("svg:image")
        .attr("xlink:href", function (d) { return getHouses(d, donutNumber); })
        .attr("width", 80)
        .attr("height", 80);
      houses
        .append("g")
        .attr("transform", function (d) {
          var _d = arc.centroid(d);
          _d[0] = _d[0] + 710;	//multiply by a constant factor
          _d[1] = _d[1] + 710;	//multiply by a constant factor
          return "translate(" + _d + ")";
        })
        .append("svg:image")
        .attr("xlink:href", function (d) { return getHotel(d, donutNumber); })
        .attr("width", 30)
        .attr("height", 30);
    }

    function createProbabilityLine(svg, data_ready, innerRadius, outerRadius) {
      var arc = d3.arc()
        .outerRadius(outerRadius)
        .innerRadius(innerRadius);
      var completeData = [...data_ready];
      var lastElement = {};
      Object.assign(lastElement, completeData[0]);
      lastElement["cardIndex"] = 28;
      completeData.push(lastElement);
      var probabilityLine = svg
        .selectAll('arc')
        .data(completeData)
        .enter();
      probabilityLine
        .append('path')
        .datum(completeData)
        .attr("transform", "translate(" + 710 + "," + 710 + ")")
        .attr("fill", "none")
        .attr("stroke", "#4099ff")
        .attr("d", line);
    }

    d3.json("https://monopoly-nus.appspot.com/api/locations/singapore").then(propertyData => {
      var properties = propertyData['locations'];
      d3.json("https://monopoly-nus.appspot.com/api/basic/strategy/1").then(strategyData => {
        var strategy = strategyData['locations'];
        for (let x = 0; x < properties.length; x++) {
          var currentProperty = properties[x];
          currentProperty["p_landings"] = strategy[x]["p_landings"];
          currentProperty["recommendation"] = strategy[x]["recommendation"];
          currentProperty["build_order"] = strategy[x]["build_order"];
          currentProperty["build_cost"] = strategy[x]["build_cost"];
          currentProperty["expected_cost"] = strategy[x]["expected_cost"];
          currentProperty["expected_rent"] = strategy[x]["expected_rent"];
          if (strategy[x]["p_landings"] < minProbability) {
            minProbability = strategy[x]["p_landings"];
          }
          if (strategy[x]["p_landings"] > maxProbability) {
            maxProbability = strategy[x]["p_landings"];
          }
        }
        console.log("minProbability: " + minProbability);
        console.log("maxProbability: " + maxProbability);
        console.log(properties);
        // Create dummy data
        var cardData = properties.filter(isPurchaseableCard);
        for (let step = 0; step < cardData.length; step++) {
          cardData[step]["cardIndex"] = step;
        }
        console.log(cardData);

        // Compute the position of each group on the pie:
        var pie = d3.pie()
          .value(function (d) { return 1; })
        var data_ready = pie(cardData);
        var arc = d3.arc()
          .innerRadius(550)         // This is the size of the donut hole
          .outerRadius(700);
        // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        svg
          .selectAll('whatever')
          .data(data_ready)
          .enter()
          .append('path')
          .attr("transform", "translate(" + 710 + "," + 710 + ")")
          .attr('fill', getColor)
          .attr("stroke", "black")
          .style("stroke-width", "2px")
          .style("opacity", 0.7)
          .on("mouseover", mouseOver)
          .on("mouseout", mouseOut);
        // .on(eventObj);

        createInnerDonut(svg, data_ready, 400, 550, 1);
        // createInnerDonut(svg, data_ready, 250, 400, 2);
        // createProbabilityLine(svg, data_ready, 200, 250);
      });
    });
  }
}
