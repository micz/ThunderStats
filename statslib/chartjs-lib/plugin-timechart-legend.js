/*
 *  ThunderStats [https://micz.it/thunderbird-addon-thunderstats-your-thunderbird-statistics/]
 *  Copyright (C) 2024 - 2026 Mic (m@micz.it)

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

const getOrCreateLegendList = (chart, id) => {
    const legendContainer = document.getElementById(id);
    if(legendContainer == null) return null;
    let listContainer = legendContainer.querySelector('ul');
  
    if (!listContainer) {
      listContainer = document.createElement('ul');
      listContainer.style.margin = 0;
      listContainer.style.padding = 0;
  
      legendContainer.appendChild(listContainer);
    }
  
    return listContainer;
  };

  function replaceLabelString(text) {
    let newValue = text;

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
    return newValue;
  }
  
  export const htmlLegendPlugin = {
    id: 'htmlLegend',
    afterUpdate(chart, args, options) {
        //console.log(">>>>>>>>>>>>> containerID: " + options.containerID);
      const ul = getOrCreateLegendList(chart, options.containerID);
      if(ul == null) return;
  
      // Remove old legend items
      while (ul.firstChild) {
        ul.firstChild.remove();
      }

      if(options.is_today) options.is_yesterday = false;
      // console.log(">>>>>>>>>>>>> is_yesterday: " + options.is_yesterday);
      // console.log(">>>>>>>>>>>>> is_today: " + options.is_today);
      // console.log(">>>>>>>>>>>>>> is_last_business_day: " + options.is_last_business_day);
  
      // Reuse the built-in legendItems generator
      const items = chart.options.plugins.legend.labels.generateLabels(chart);
  
      items.forEach((item,i) => {

        if((i == 0) || (i == 2)) {
            const li_ty = document.createElement('li');
            li_ty.classList.add('day_today_title');
            if(i==2){
              li_ty.classList.add('day_today_title_yesterday');
            }
            if ((i == 0) && options.is_today) {
              li_ty.innerText = browser.i18n.getMessage('Today');
            } else if (((i > 0) && options.is_today) || options.is_yesterday) {
              if (options.is_custom_comparison_day) {
                li_ty.innerText = options.custom_comparison_day_text;
              } else {
                li_ty.innerText = options.is_last_business_day ? browser.i18n.getMessage('LastBusinessDay') : browser.i18n.getMessage('Yesterday');
              }
            } else {
              li_ty.innerText = (i == 0) ? browser.i18n.getMessage('Mails') : '&nbsp;';
            }
            //li_ty.innerText = ((i == 0) && options.is_today) ? browser.i18n.getMessage('Today') : browser.i18n.getMessage('Yesterday');
            ul.appendChild(li_ty);
          }

        const li = document.createElement('li');
        li.style.alignItems = 'center';
        li.style.cursor = 'pointer';
  
        li.onclick = () => {
          const {type} = chart.config;
          chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
          chart.update();
        };
  
        // Color box
        const boxSpan = document.createElement('span');
        boxSpan.style.background = item.fillStyle;
        boxSpan.style.borderColor = item.strokeStyle;
        boxSpan.style.borderWidth = item.lineWidth + 'px';
        boxSpan.style.display = 'inline-block';
        boxSpan.style.flexShrink = 0;
        boxSpan.style.height = '10px';
        boxSpan.style.marginRight = '5px';
        boxSpan.style.width = '10px';
  
        // Text
        const textContainer = document.createElement('span');
        textContainer.style.color = item.fontColor;
        textContainer.style.margin = 0;
        textContainer.style.padding = 0;
        textContainer.style.textDecoration = item.hidden ? 'line-through' : '';
  
        const text = document.createTextNode(replaceLabelString(item.text));
        textContainer.appendChild(text);
  
        li.appendChild(boxSpan);
        li.appendChild(textContainer);
        ul.appendChild(li);
      });
    }
  };