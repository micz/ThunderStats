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

      // let count_slice = 0;

      let usedSlots = {
        left: new Set(),
        right: new Set()
      };

      chart.data.datasets.forEach((dataset, i) => {
        //let onlyOne = (chart.getDatasetMeta(i).data.length == 1);
        chart.getDatasetMeta(i).data.forEach((datapoint, index) => {
          const { x: a, y: b } = datapoint.tooltipPosition();
          // let x = 127.5;
          // let y = 155;

          // count_slice++;

          const radius = datapoint.outerRadius; // Outer radius of the slice
          const startAngle = datapoint.startAngle * (180 / Math.PI); // Start angle in degrees
          const endAngle = datapoint.endAngle * (180 / Math.PI); // End angle in degrees

          // Calculate the extreme points
          const extremePoints = getExtremePoints(centerX, centerY, radius, startAngle, endAngle);

          const { newX, newY } = moveTooltipPoint(centerX, centerY, a, b, thickness / 2);
          let x = newX;
          let y = newY;

          // draw line
          const halfwidth = centerX;
          const halfheight = centerY;

          let extraLine = x > halfwidth ? 10 : -10;

          let is_dx = x > halfwidth;

          let slot = getLabelSlot(outerRadius, centerX, centerY, x, y, usedSlots);
          let xLine = slot.position.x;
          let yLine = slot.position.y;

          // console.log(">>>>>>>>> chart.data.labels[index]: " + chart.data.labels[index]);
          // console.log(">>>>>>>>>>> slot: " + JSON.stringify(slot));

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
          // console.log(">>>>>>>>> slot: " + JSON.stringify(slot));
          // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

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
          ctx.textAlign = textXPosition;
          ctx.textBaseline = "middle";
          // ctx.fillStyle = dataset.backgroundColor[index];
          ctx.fillStyle = chart.options.color;

          let label_text = '';

          if(is_dx){
            label_text = '('+ chart.data.datasets[0].data[index] +') ' + chart.data.labels[index]; // + " ["+count_slice+"]";
          }else{
            label_text = chart.data.labels[index] + ' ('+ chart.data.datasets[0].data[index] +')'; // + " ["+count_slice+"]";
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
  
// Create an object to track used slots for both columns
// let usedSlots = {
//   left: new Set(),
//   right: new Set()
// };

function getLabelSlot(outerRadius, centerX, centerY, x, y, usedSlots) {
  // Define the height of each slot and the horizontal offset for the label positioning
  const slotHeight = 14;
  const labelOffset = 20; // Distance from the edge of the chart to the label

  // Determine if the point is on the right or left side of the doughnut chart
  const isRightColumn = x > centerX;
  const column = isRightColumn ? 'right' : 'left';

  // Calculate the maximum and minimum y positions that correspond to the top and bottom slots
  const minY = centerY - outerRadius; // Topmost slot within the outerRadius
  const maxY = centerY + outerRadius; // Bottommost slot within the outerRadius

  // Ensure y is within bounds of the outer radius (optional, we don't restrict it now)
  if (y < minY) y = minY;
  if (y > maxY) y = maxY;

  // Calculate the slot index from the bottom (maxY) to the top (minY)
  let slotIndex = Math.floor((maxY - y) / slotHeight);
  // console.log(">>>>>>>>>>> first slotIndex: " + slotIndex);

  // Adjust the slotIndex based on the region: right-lower or left-upper
  if (isRightColumn && y >= centerY) {
    // Right side and below the center, prioritize searching downwards first
    while (usedSlots[column].has(slotIndex)) {
      //if (!usedSlots[column].has(slotIndex + 1)) {
        slotIndex--; // Search downwards
      /*} else if (!usedSlots[column].has(slotIndex - 1)) {
        slotIndex--; // If down is full, search upwards
      } else {
        break; // If no available slot, stop
      }*/
      if (slotIndex > 25) break;
    }
  } else if (!isRightColumn && y < centerY) {
    // Left side and above the center, prioritize searching upwards first
    while (usedSlots[column].has(slotIndex)) {
      //if (!usedSlots[column].has(slotIndex - 1)) {
        slotIndex++; // Search upwards
      /*} else if (!usedSlots[column].has(slotIndex + 1)) {
        slotIndex++; // If up is full, search downwards
      } else {
        break; // If no available slot, stop
      }*/
      if (slotIndex < -5) break;
    }
  } else {
    // For other cases, alternate upwards and downwards search as before
    while (usedSlots[column].has(slotIndex)) {
      //if (!usedSlots[column].has(slotIndex + 1)) {
        slotIndex++;
      /*} else if (!usedSlots[column].has(slotIndex - 1)) {
        slotIndex--;
      } else {
        break;
      }*/
      if (slotIndex > 25) break;
    }
  }

  // Mark this slot as used
  usedSlots[column].add(slotIndex);
  // console.log(">>>>>>>> count_slice: " + count_slice);
  // console.log(">>>>>>>> slotIndex: " + slotIndex);


  // Calculate the x position for the label, 20px beyond the edge of the doughnut chart
  const labelX = isRightColumn
    ? centerX + outerRadius + labelOffset  // 20px to the right of the chart
    : centerX - outerRadius - labelOffset; // 20px to the left of the chart

  // Return the slot position, including which column (left or right), slot index, and label position
  return {
    column: column,
    slotIndex: slotIndex,
    position: {
      // X position for the label
      x: labelX,
      // Y position for the label, can go beyond the outerRadius limit
      y: maxY - slotIndex * slotHeight // Continue adding slots above or below
    }
  };
}
