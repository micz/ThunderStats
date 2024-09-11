/*
 *  ThunderStats [https://micz.it/thunderbird-addon-thunderstats-your-thunderbird-statistics/]
 *  Copyright (C) 2024  Mic (m@micz.it)

 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.

 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.

 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

export const tsDoughnutLabelsLine = {
    id: "tsDoughnutLabelsLine",
    afterDraw(chart) {
      const {
        ctx,
        chartArea: { width, height },
      } = chart;

      const doughnutMeta = chart.getDatasetMeta(0);
      const outerRadius = doughnutMeta.controller.outerRadius;
      const innerRadius = doughnutMeta.controller.innerRadius;
      const thickness = outerRadius - innerRadius;
      const centerX = doughnutMeta.controller.chart.chartArea.left + (doughnutMeta.controller.chart.chartArea.right - doughnutMeta.controller.chart.chartArea.left) / 2;
      const centerY = doughnutMeta.controller.chart.chartArea.top + (doughnutMeta.controller.chart.chartArea.bottom - doughnutMeta.controller.chart.chartArea.top) / 2;

      // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      // console.log(">>>>>>>>> centerX: " + centerX);
      // console.log(">>>>>>>>> centerY: " + centerY);
      // console.log(">>>>>>>>> thickness: " + thickness);
      // console.log(">>>>>>>>> width: " + width);
      // console.log(">>>>>>>>> height: " + height);
      // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

      //let count_slice = 0;
      let count_fixed = {};
      count_fixed.top = 0;
      count_fixed.bottom = 0;

      chart.data.datasets.forEach((dataset, i) => {
        //let onlyOne = (chart.getDatasetMeta(i).data.length == 1);
        chart.getDatasetMeta(i).data.forEach((datapoint, index) => {
          const { x: a, y: b } = datapoint.tooltipPosition();
          // let x = 127.5;
          // let y = 155;

          //count_slice++;

          const radius = datapoint.outerRadius; // Outer radius of the slice
          const startAngle = datapoint.startAngle * (180 / Math.PI); // Start angle in degrees
          const endAngle = datapoint.endAngle * (180 / Math.PI); // End angle in degrees

          // Calculate the extreme points
          const extremePoints = getExtremePoints(centerX, centerY, radius, startAngle, endAngle);

          // if(!onlyOne) {
          const { newX, newY } = moveTooltipPoint(centerX, centerY, a, b, thickness / 2);
          let x = newX;
          let y = newY;
          // }

          // draw line
          const halfwidth = centerX;
          const halfheight = centerY;
          let xLine = x > halfwidth ? x + 20 : x - 20;
          let yLine = y >= halfheight ? y + 20 : y - 20;
          const yLine_original = yLine;

          let extraLine = x > halfwidth ? 10 : -10;
          
          let _position_fix = checkSlicePosition(centerX, centerY, extremePoints);

          let is_dx = x > halfwidth;

          // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
          // console.log(">>>>>>>>> chart.data.labels[index]: " + chart.data.labels[index]);// + " ["+count_slice+"]");
          // console.log(">>>>>>>>> a: " + a);
          // console.log(">>>>>>>>> b: " + b);
          // console.log(">>>>>>>>> x: " + x);
          // console.log(">>>>>>>>> y: " + y);
          // console.log(">>>>>>>> extremePoints.startPoint: " + JSON.stringify(extremePoints.startPoint));
          // console.log(">>>>>>>> extremePoints.endPoint: " + JSON.stringify(extremePoints.endPoint));
          // console.log(">>>>>>>> xLine: " + xLine);
          // console.log(">>>>>>>> yLine: " + yLine);
          // console.log(">>>>>>>>> extraLine: " + extraLine);
          // console.log(">>>>>>>> _position_fix: " + JSON.stringify(_position_fix));
          // console.log(">>>>>>>>> count_fixed: " + JSON.stringify(count_fixed));
          // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

          if(_position_fix.is_top){
            if(count_fixed.top > 0){
              yLine -= 8 * count_fixed.top;
            }
            count_fixed.top++;
          }
          if(_position_fix.is_bottom){
            if(count_fixed.bottom > 0){
              yLine += 8 * count_fixed.bottom;
            }
            count_fixed.bottom++;
          }

          if(_position_fix.needed){
            yLine = yLine_original;
            xLine = xLine - Math.abs(2 * ( x - xLine ));
            //yLine = y >= halfheight ? y + 20 : y - 20;
            extraLine = -extraLine;
            is_dx = !is_dx;
          }

          ctx.beginPath();
          ctx.moveTo(x, y);
          //ctx.arc(x, y, 2, 0, 2 * Math.PI, true);
          //ctx.fill();
          ctx.moveTo(x, y);
          ctx.lineTo(xLine, yLine);
          ctx.lineTo(xLine + extraLine, yLine);
          // ctx.strokeStyle = dataset.backgroundColor[index];
          ctx.strokeStyle = chart.options.color;
          ctx.stroke();

          // text
          const textWidth = ctx.measureText(chart.data.labels[index]).width;
          ctx.font = "12px Arial";
          // control the position
          let textXPosition = x > halfwidth ? "left" : "right";
          let plusFivePx = x > halfwidth ? 5 : -5;
          if(_position_fix.needed){
            textXPosition = textXPosition == "right" ? "left" : "right";
            plusFivePx = -plusFivePx;
          }
          ctx.textAlign = textXPosition;
          ctx.textBaseline = "middle";
          // ctx.fillStyle = dataset.backgroundColor[index];
          ctx.fillStyle = chart.options.color;

          let label_text = '';

          if(is_dx){
            label_text = '('+ chart.data.datasets[0].data[index] +') ' + chart.data.labels[index]; // + " ["+count_slice+"]",
          }else{
            label_text = chart.data.labels[index] + ' ('+ chart.data.datasets[0].data[index] +')'; // + " ["+count_slice+"]",
          }

          ctx.fillText(
            //((chart.data.datasets[0].data[index] * 100) / sum).toFixed(2) + "%",
            label_text,
            xLine + extraLine + plusFivePx,
            yLine
          );

          // ctx.arc(extremePoints.startPoint.x, extremePoints.startPoint.y, 2, 0, 2 * Math.PI, true);
          // ctx.fill();
        });
      });
    },
  };


  function moveTooltipPoint(centerX, centerY, pointX, pointY, offset) {
    // Calculate directional vector from center to the point
    const dx = pointX - centerX;
    const dy = pointY - centerY;

    // Calculate the length of the vector
    const length = Math.sqrt(dx * dx + dy * dy);

    // Calculate unit vector
    const ux = dx / length;
    const uy = dy / length;

    // Calculate new coordinates with the offset applied
    const newX = pointX + offset * ux;
    const newY = pointY + offset * uy;

    return {newX, newY};
  }


  // Function to calculate the extreme points of a slice
  function getExtremePoints(centerX, centerY, radius, startAngle, endAngle) {
    // Convert the start angle to radians
    const startRadians = (startAngle) * (Math.PI / 180);
    const endRadians = (endAngle) * (Math.PI / 180);

    // Calculate the coordinates of the starting extreme point
    const startPoint = {
        x: centerX + radius * Math.cos(startRadians),
        y: centerY + radius * Math.sin(startRadians)
    };

    // Calculate the coordinates of the ending extreme point
    const endPoint = {
        x: centerX + radius * Math.cos(endRadians),
        y: centerY + radius * Math.sin(endRadians)
    };

    return { startPoint, endPoint };
  }

  // check if the slice is at the top or at the bottom and is near the middle
  // return true if we need to alter the positioning of the label
  function checkSlicePosition(centerX, centerY, extremePoints){     
    const { startPoint, endPoint } = extremePoints;

    let extreme_start_x = Math.trunc(extremePoints.startPoint.x);
    let extreme_end_x = Math.trunc(extremePoints.endPoint.x);
    let extreme_start_y = Math.trunc(extremePoints.startPoint.y);
    let extreme_end_y = Math.trunc(extremePoints.endPoint.y);

    centerX = Math.trunc(centerX);
    centerY = Math.trunc(centerY);

    // is at the top or the bottom
    let is_top = (extreme_start_y < centerY) && (extreme_end_y < centerY);
    let is_bottom = (extreme_start_y > centerY) && (extreme_end_y > centerY);

    // is around horizontal midpoint
    let is_middle = false;
    if(extremePoints.startPoint.x > extremePoints.endPoint.x){
      is_middle = (extreme_start_x >= centerX) && (extreme_end_x <= centerX);
    }else{
      is_middle = (extreme_start_x <= centerX) && (extreme_end_x >= centerX);
    }

    // is big enough
    let is_big = false;
    if(Math.abs(extreme_start_x - extreme_end_x) > 50){
      is_big = true;
    }

    // console.log(">>>>>>>> centerX: " + centerX);
    // console.log(">>>>>>>> centerY: " + centerY);
    // console.log(">>>>>>>> extreme_start_x: " + extreme_start_x);
    // console.log(">>>>>>>> extreme_end_x: " + extreme_end_x);
    // console.log(">>>>>>>> extreme_start_y: " + extreme_start_y);
    // console.log(">>>>>>>> extreme_end_y: " + extreme_end_y);
    // console.log(">>>>>>>>> is_top: " + is_top);
    // console.log(">>>>>>>>> is_bottom: " + is_bottom);
    // console.log(">>>>>>>>> is_middle: " + is_middle);

    return {needed: (is_top || is_bottom) && is_middle && !is_big, is_top: is_top, is_bottom: is_bottom, is_middle: is_middle};
  }