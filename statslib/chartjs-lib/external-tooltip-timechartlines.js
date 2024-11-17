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

const getOrCreateTooltip = (chart) => {
    let tooltipEl = chart.canvas.parentNode.querySelector('div');
  
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.classList.add('tooltip-light');
      // tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)';
      // tooltipEl.style.borderRadius = '3px';
      // tooltipEl.style.color = 'white';
      tooltipEl.style.opacity = 1;
      tooltipEl.style.pointerEvents = 'none';
      tooltipEl.style.position = 'absolute';
      tooltipEl.style.transform = 'translate(-50%, 0)';
      tooltipEl.style.transition = 'all .1s ease';
  
      const table = document.createElement('table');
      table.style.margin = '0px';
      table.style.width = '100%';
  
      tooltipEl.appendChild(table);
      chart.canvas.parentNode.appendChild(tooltipEl);
    }
  
    return tooltipEl;
  };

  function gethoursRangeString(input){
    return [input + ':00 - ' + input + ":59"];
  }

  function replaceTooltipString(array) {
    let newValue = array[0].split(': ')[0];
    let output_array = [...array]

    switch (newValue) {
      case 'tsent':
      case 'ysent':
        newValue = browser.i18n.getMessage('TimeChart.Sent');
        break;
      case 'trcvd':
      case 'yrcvd':
        newValue = browser.i18n.getMessage('TimeChart.Rcvd');
        break;
      default:
        break;
    }

    let parts = output_array[0].split(': ');
    let updatedString = newValue + ': ' + parts[1];
    output_array[0] = updatedString;
    return output_array;
  }

  
export const externalTooltipTimeChartLines = (context, extra_params = null) => {
    // Tooltip Element
    const {chart, tooltip} = context;
    const tooltipEl = getOrCreateTooltip(chart);

    let is_generic_day = false;
    let is_last_business_day = false;

    if(extra_params != null){
      if('is_generic_day' in extra_params){
        is_generic_day = extra_params.is_generic_day;
      }
      if('is_last_business_day' in extra_params){
        is_last_business_day = extra_params.is_last_business_day;
      }
    }
  
    // Hide if no tooltip
    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = 0;
      return;
    }
  //console.log('>>>>>>>>>>>>>>>>>>> tooltip.body: ', JSON.stringify(tooltip.body));
    // Set Text
    if (tooltip.body) {
      const titleLines = gethoursRangeString(tooltip.title);
      const bodyLines = tooltip.body.map(b => b.lines);

  //console.log('>>>>>>>>>>>>>>>>>>> bodyLines: ', JSON.stringify(bodyLines));
      const tableHead = document.createElement('thead');
  
      titleLines.forEach(title => {
        const tr = document.createElement('tr');
        tr.style.borderWidth = 0;
  
        const th = document.createElement('th');
        th.style.borderWidth = 0;
        const text = document.createTextNode(title);
  
        th.appendChild(text);
        tr.appendChild(th);
        tableHead.appendChild(tr);
      });
  
      const tableBody = document.createElement('tbody');
      bodyLines.forEach((body, i) => {
        const colors = tooltip.labelColors[i];
  
        const span = document.createElement('span');
        span.style.background = colors.backgroundColor;
        span.style.borderColor = colors.borderColor;
        span.style.borderWidth = '2px';
        span.style.marginRight = '10px';
        span.style.height = '10px';
        span.style.width = '10px';
        span.style.display = 'inline-block';
  
        const tr = document.createElement('tr');
        tr.style.backgroundColor = 'inherit';
        tr.style.borderWidth = 0;
  
        const td = document.createElement('td');
        td.classList.add('tooltip-content');
        td.style.borderWidth = 0;
  
        //const text = document.createTextNode(body);
        const text = document.createElement('span');
        //body = body[0].replace(/ /g, '<br>');
        //body[0] = body[0].substring(0, body[0].lastIndexOf(':'));
        text.innerHTML = replaceTooltipString(body);

        //console.log('>>>>>>>>>>>>>>>>>>> bodyLines: ', JSON.stringify(bodyLines));

        if((i == 0) || (i == 2)) {
          const tr_ty = document.createElement('tr');
          tr_ty.style.backgroundColor = 'inherit';
          tr_ty.style.borderWidth = 0;
          const td_ty = document.createElement('td');
          td_ty.classList.add('tooltip-content');
          td_ty.style.borderWidth = 0;
          const text_ty = document.createElement('span');
          text_ty.innerHTML = ((i == 0) && (bodyLines.length > 2)) ? browser.i18n.getMessage('Today') : (is_generic_day ? '' : (is_last_business_day ? browser.i18n.getMessage('LastBusinessDay') : browser.i18n.getMessage('Yesterday')));
          td_ty.appendChild(text_ty);
          tr_ty.appendChild(td_ty);
          tableBody.appendChild(tr_ty);
        }
  
        td.appendChild(span);
        td.appendChild(text);
        tr.appendChild(td);
        tableBody.appendChild(tr);
      });
  
      const tableRoot = tooltipEl.querySelector('table');
  
      // Remove old children
      while (tableRoot.firstChild) {
        tableRoot.firstChild.remove();
      }
  
      // Add new children
      tableRoot.appendChild(tableHead);
      tableRoot.appendChild(tableBody);
    }
  
    const {offsetLeft: positionX, offsetTop: positionY} = chart.canvas;
  
    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;
    if((positionX - 30) + tooltip.caretX < 65) {
      tooltipEl.style.left = '65px';
    }else{
      tooltipEl.style.left = (positionX - 30) + tooltip.caretX + 'px';
    }
    //console.log('>>>>>>>>>>>>>>>>>>> tooltipEl.style.left: ', JSON.stringify(tooltipEl.style.left));
    tooltipEl.style.top = positionY + tooltip.caretY + 'px';
    tooltipEl.style.font = tooltip.options.bodyFont.string;
    tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
  };