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

      chart.data.datasets.forEach((dataset, i) => {
        //let onlyOne = (chart.getDatasetMeta(i).data.length == 1);
        chart.getDatasetMeta(i).data.forEach((datapoint, index) => {
          const { x: a, y: b } = datapoint.tooltipPosition();
          // let x = 127.5;
          // let y = 155;

          // if(!onlyOne) {
            const { newX, newY } = moveTooltipPoint(centerX, centerY, a, b, thickness / 2);
            let x = newX;
            let y = newY;
          // }

          // draw line
          const halfwidth = width / 2;
          const halfheight = height / 2;
          const xLine = x >= halfwidth ? x + 20 : x - 20;
          const yLine = y >= halfheight ? y + 20 : y - 20;

          const extraLine = x >= halfwidth ? 10 : -10;

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
          const textXPosition = x >= halfwidth ? "left" : "right";
          const plusFivePx = x >= halfwidth ? 5 : -5;
          ctx.textAlign = textXPosition;
          ctx.textBaseline = "middle";
          // ctx.fillStyle = dataset.backgroundColor[index];
          ctx.fillStyle = chart.options.color;

          ctx.fillText(
            //((chart.data.datasets[0].data[index] * 100) / sum).toFixed(2) + "%",
            chart.data.labels[index] + ' ('+ chart.data.datasets[0].data[index] +')',
            xLine + extraLine + plusFivePx,
            yLine
          );
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
//console.log(">>>>>>>>>>>>>> newX: " + newX + " newY: " + newY);
    return {newX, newY};
}