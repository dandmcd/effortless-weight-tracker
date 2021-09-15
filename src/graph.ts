import * as d3 from 'd3';
import { db } from './config/firebase';

export interface Weights {
  id: string;
  userId: string;
  date: string;
  weight: number;
}

const margin = { top: 80, right: 20, bottom: 80, left: 50 };
const graphWidth = 560 - margin.right - margin.left;
const graphHeight = 360 - margin.top - margin.bottom;

// //Resize chart when window resized
// d3.select(window).on('resize', resize);

const formatTime = d3.timeFormat('%b %d');

const div = d3
  .select('body')
  .append('div')
  .attr(
    'class',
    'z-10 absolute text-center w-16 p-1 font-sans text-xs text-myLight bg-myDarkBlue rounded-lg',
  )
  .style('opacity', 0);

const svg = d3
  .select('.canvas')
  .append('svg')
  .attr('preserveAspectRatio', 'xMinYMin meet')
  .attr('viewBox', '0 0 560 360')
  .classed('svg-content', true)
  // .attr('width', graphWidth + margin.left + margin.right)
  // .attr('height', graphHeight + margin.top + margin.bottom)
  .style('filter', 'url(#gooey)'); //Set the filter on the container

// Define drop shadows for circles
const defs = svg.append('defs');

var dropShadowFilter = defs
  .append('svg:filter')
  .attr('id', 'drop-shadow')
  .attr('filterUnits', 'userSpaceOnUse')
  .attr('width', '250%')
  .attr('height', '250%');
dropShadowFilter
  .append('svg:feGaussianBlur')
  .attr('in', 'SourceGraphic')
  .attr('stdDeviation', 3)
  .attr('result', 'blur-out');
dropShadowFilter
  .append('svg:feColorMatrix')
  .attr('in', 'blur-out')
  .attr('type', 'hueRotate')
  .attr('values', '1 0 0 0 0  0 1 0 0 0 0 0 1 0 0 0 0 0 100 0')
  .attr('result', 'color-out');
dropShadowFilter
  .append('svg:feOffset')
  .attr('in', 'color-out')
  .attr('dx', 1)
  .attr('dy', 1)
  .attr('result', 'the-shadow');
dropShadowFilter
  .append('svg:feBlend')
  .attr('in', 'SourceGraphic')
  .attr('in2', 'the-shadow')
  .attr('mode', 'normal');

const graph = svg
  .append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// scales
const x = d3.scaleTime().range([0, graphWidth]);
const y = d3.scaleLinear().range([graphHeight, 0]);

// axes groups
const xAxisGroup = graph
  .append('g')
  .attr('class', 'x-axis')
  .attr('transform', 'translate(0,' + graphHeight + ')');

const yAxisGroup = graph.append('g').attr('class', 'y-axis');

// d3 line path generator
const line = d3
  .line()
  .curve(d3.curveMonotoneX)
  .x(function (d) {
    return x(new Date(d.date));
  })
  .y(function (d) {
    return y(d.weight);
  });

// line path element
const path = graph.append('path');

// create dotted line group and append to graph
const dottedLines = graph
  .append('g')
  .attr('class', 'lines')
  .style('opacity', 0);

// create x dotted line and append to dotted line group
const xDottedLine = dottedLines
  .append('line')
  .attr('stroke', '#817474')
  .attr('stroke-width', 0.5)
  .attr('stroke-dasharray', 1);

// create y dotted line and append to dotted line group
const yDottedLine = dottedLines
  .append('line')
  .attr('stroke', '#817474')
  .attr('stroke-width', 0.5)
  .attr('stroke-dasharray', 1);

// update function
const update = (data: Weights[]) => {
  data.sort((a, b) => new Date(a.date) - new Date(b.date));

  // set scale domains
  x.domain(d3.extent(data, (d) => new Date(d.date)));
  y.domain([
    d3.min(data, (d) => d.weight) - 5,
    d3.max(data, (d) => d.weight) + 5,
  ]);

  // update path data
  path
    .data([data])
    .attr('fill', 'none')
    .attr('stroke', '#47adbd')
    .attr('stroke-width', '8')
    .style('filter', 'url(#drop-shadow)')
    .attr('d', line);

  const totalLength = path.node().getTotalLength();

  path
    .attr('stroke-dasharray', totalLength + ' ' + totalLength)
    .attr('stroke-dashoffset', totalLength)
    .transition()
    .duration(2000)
    .ease(d3.easeQuadOut)
    .attr('stroke-dashoffset', 0)
    .transition()
    .duration(2000)
    .attr('stroke-width', '5');

  // graph.on('click', function () {
  //   path
  //     .transition()
  //     .duration(2000)
  //     .ease(d3.easeLinear)
  //     .attr('stroke-dashoffset', totalLength);
  // });

  // create circles for points
  const circles = graph.selectAll('circle').data(data);

  // remove unwanted points
  circles.exit().remove();

  // update current points
  circles
    .transition('circlepop')
    .duration(1000)
    .attr('fill', '#307580')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 15)
    .transition('circlepop')
    .duration(1000)
    .attr('cx', (d) => x(new Date(d.date)))
    .attr('cy', (d) => y(d.weight))
    .attr('fill', (d) => {
      // Compare data changes, and style circle based on day by day progress
      const index = data.findIndex((w) => w.id == d.id);
      if (index === 0) {
        return '#44b553';
      } else if (data[index - 1].weight < data[index].weight) {
        return '#ff7660';
      } else {
        return '#44b553';
      }
    })
    .transition('circlepop')
    .duration(1000)
    .ease(d3.easeLinear)
    .attr('r', 12)
    .transition('circlepop')
    .duration(1000)
    .ease(d3.easeLinear)
    .attr('r', 8);

  // add new points
  circles
    .enter()
    .data(data)
    .append('circle')
    .attr('class', 'circles')
    .style('filter', 'url(#drop-shadow)')
    .transition('circlepop')
    .delay(300)
    .duration(1000)
    .attr('fill', '#307580')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 15)

    .transition('circlepop')
    .duration(1000)
    .attr('r', '8')
    .attr('cx', (d) => x(new Date(d.date)))
    .attr('cy', (d) => y(d.weight))
    .attr('fill', (d) => {
      // Compare data changes, and style circle based on day by day progress
      const index = data.findIndex((w) => w.id == d.id);
      if (index === 0) {
        return '#44b553';
      } else if (data[index - 1].weight < data[index].weight) {
        return '#ff7660';
      } else {
        return '#44b553';
      }
    })
    .transition('circlepop')
    .delay(300)
    .duration(1000)
    .attr('r', 12)
    .transition('circlepop')
    .duration(1000)
    .attr('r', 8);

  // add event listeners to circle (and show dotted lines)
  graph
    .selectAll('circle')
    // .on('click', function (event, d) {
    //   div.transition().duration(200).style('opacity', 0.9);
    //   div
    //     .html(
    //       formatTime(new Date(d.date)) +
    //         '<br/>' +
    //         d.weight +
    //         '<br/>' +
    //         '<div class="edit">Edit</div>' +
    //         '<button type="button" id="delete">Delete</div>',
    //     )
    //     .style('left', event.pageX + 'px')
    //     .style('top', event.pageY - 28 + 'px');
    // })
    .on('mouseover', function (event, d) {
      div.transition('test').duration(200).style('opacity', 0.9);
      div
        .html(
          formatTime(new Date(d.date)) +
            '<br/>' +
            d.weight +
            '<br/>' +
            '<div class="flex justify-evenly"><button type="button" id="input-edit" aria-label="Edit Weight"><svg class="text-myLight fill-current h-4" viewBox="0 -1 401.523 401"><path d="M370.59 250.973c-5.524 0-10 4.476-10 10v88.789c-.02 16.562-13.438 29.984-30 30H50c-16.563-.016-29.98-13.438-30-30V89.172c.02-16.559 13.438-29.98 30-30h88.79c5.523 0 10-4.477 10-10 0-5.52-4.477-10-10-10H50c-27.602.031-49.969 22.398-50 50v260.594c.031 27.601 22.398 49.968 50 50h280.59c27.601-.032 49.969-22.399 50-50v-88.793c0-5.524-4.477-10-10-10zm0 0"/><path d="M376.629 13.441c-17.574-17.574-46.067-17.574-63.64 0L134.581 191.848a9.997 9.997 0 00-2.566 4.402l-23.461 84.7a9.997 9.997 0 0012.304 12.308l84.7-23.465a9.997 9.997 0 004.402-2.566l178.402-178.41c17.547-17.587 17.547-46.055 0-63.641zM156.37 198.348L302.383 52.332l47.09 47.09-146.016 146.016zm-9.406 18.875l37.62 37.625-52.038 14.418zM374.223 74.676L363.617 85.28l-47.094-47.094 10.61-10.605c9.762-9.762 25.59-9.762 35.351 0l11.739 11.734c9.746 9.774 9.746 25.59 0 35.36zm0 0"/></svg>' +
            '<button type="button" id="delete" aria-label="Delete entry"><svg  class="text-myError fill-current h-4"  viewBox="0 0 407.521 407.521"><path d="M335.94 114.944H71.581a10.45 10.45 0 00-7.837 2.612 8.88 8.88 0 00-2.612 7.837l27.167 236.669c3.186 26.093 25.436 45.647 51.722 45.453h131.657c27.026.385 49.791-20.104 52.245-47.02l22.465-236.147a8.882 8.882 0 00-2.612-6.792 10.446 10.446 0 00-7.836-2.612zM303.026 359.45c-1.642 15.909-15.366 27.803-31.347 27.167H140.022c-15.694.637-29.184-11.024-30.825-26.645l-26.122-224.13h241.371l-21.42 223.608zM374.079 47.026H266.454V30.307c.58-16.148-12.04-29.708-28.188-30.288a29.104 29.104 0 00-1.591-.014h-65.829c-16.156-.299-29.494 12.555-29.793 28.711-.01.53-.005 1.061.014 1.591v16.718H33.442c-5.771 0-10.449 4.678-10.449 10.449s4.678 10.449 10.449 10.449h340.637c5.771 0 10.449-4.678 10.449-10.449s-4.679-10.448-10.449-10.448zM245.556 30.307v16.718h-83.592V30.307a8.36 8.36 0 018.881-9.404h65.829a8.359 8.359 0 018.882 9.404z"/></svg></div></div>',
        )

        .style('left', event.pageX + 'px')
        .style('top', event.pageY - 28 + 'px');
      d3.select('#input-edit').on('click', function () {
        let input = prompt('Please enter a new weight', d.weight);
        let int = parseInt(input);
        if (Number.isInteger(int) && Number(int) > 0) {
          const id = d.id;
          db.collection('user_weights').doc(id).update({ weight: int });
        } else {
          console.log('Not a positive number');
        }
        // let str = parseInt(this.innerHTML);
        // console.log(str);
        // if (Number.isInteger(Number(str)) && Number(str) > 0) {
        //   const id = d.id;
        //   db.collection('user_weights').doc(id).update({ weight: str });
        // } else {
        //   console.log('Is Not');
        // }
        // event.innerHTML = '<input value="' + d.weight + '">';
        div
          .transition()
          .duration(200)
          .style('opacity', 0)
          .style('left', 'auto')
          .style('top', 'auto');
      });

      // Delete a node and reset tooltip
      d3.select('#delete').on('click', function () {
        if (window.confirm('Are you sure you wish to delete this entry?')) {
          const id = d.id;
          db.collection('user_weights').doc(id).delete();
          div
            .transition()
            .duration(200)
            .style('opacity', 0)
            .style('left', 'auto')
            .style('top', 'auto');
        }
      });
      d3.select(event.currentTarget)
        .transition()
        .duration(100)
        .attr('r', 12)
        .attr('fill', (d) => {
          // Compare data changes, and style circle based on day by day progress
          const index = data.findIndex((w) => w.id == d.id);
          if (index === 0) {
            return '#44b553';
          } else if (data[index - 1].weight < data[index].weight) {
            return '#ff7660';
          } else {
            return '#44b553';
          }
        });
      // set x dotted line coords (x1,x2,y1,y2)
      xDottedLine
        .attr('x1', x(new Date(d.date)))
        .attr('x2', x(new Date(d.date)))
        .attr('y1', graphHeight)
        .attr('y2', y(d.weight));
      yDottedLine
        .attr('x1', 0)
        .attr('x2', x(new Date(d.date)))
        .attr('y1', y(d.weight))
        .attr('y2', y(d.weight));
      // show the dotted line group (opacity)
      dottedLines.style('opacity', 1);
    })
    .on('mouseout', function (d) {
      // div.transition().duration(500).style('opacity', 0);
    })
    .on('mouseleave', (event, d) => {
      d3.select(event.currentTarget)
        .transition()
        .duration(100)
        .attr('r', 8)
        .attr('fill', (d) => {
          // Compare data changes, and style circle based on day by day progress
          const index = data.findIndex((w) => w.id == d.id);
          if (index === 0) {
            return 'green';
          } else if (data[index - 1].weight < data[index].weight) {
            return '#ff7660';
          } else {
            return '#44b553';
          }
        });
      // hide the dotted line group (opacity)
      dottedLines.style('opacity', 0);
    });

  // create axes
  const xAxis = d3
    .axisBottom(x)
    .ticks(8)
    .tickFormat(d3.timeFormat('%b %d'))
    .tickSizeOuter(0)
    .tickSizeInner(10)
    .tickPadding(5);

  const yAxis = d3
    .axisLeft(y)
    .ticks(3)
    .tickFormat((d) => d)
    .tickSizeInner(10)
    .tickSizeOuter(0)
    .tickPadding(5);

  // call axes
  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);

  // rotate axis text
  xAxisGroup
    .selectAll('text')
    .attr('transform', 'rotate(-35)')
    .attr('text-anchor', 'end');

  // x and y axis path styling
  // xAxisGroup
  //   .select('.domain')
  //   .attr('class', 'stroke-current text-myBlue stroke-2');
  // yAxisGroup
  //   .select('.domain')
  //   .attr('class', 'stroke-current text-myBlue stroke-2');

  // // x and y axis tick
  // xAxisGroup
  //   .selectAll('.tick')
  //   .attr('class', 'stroke-current text-myBright stroke-2')
  //   .attr('class', 'font-thin text-myBright');

  // yAxisGroup
  //   .selectAll('.tick')
  //   .attr('class', 'stroke-current text-colors-myBright stroke-2')
  //   .attr('class', 'font-thin text-myBright');
};
// const handleClick = (event, d) => {
//   console.log(d);
//   const id = d.id;
//   db.collection('user_weights').doc(id).delete();
// };

// const makeInput = (event, d) => {
//   console.log(event);
//   event.innerHTML = '<input value="' + event.innerText + '">';
// };
export { update };
