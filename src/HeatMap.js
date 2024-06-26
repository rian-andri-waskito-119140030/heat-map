// src/HeatMap.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './HeatMap.css';

const HeatMap = () => {
  const svgRef = useRef();

  useEffect(() => {
    // Fetch the data
    fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
      .then(response => response.json())
      .then(data => {
        const { baseTemperature, monthlyVariance } = data;

        // Define the dimensions and margins for the SVG
        const margin = { top: 50, right: 50, bottom: 100, left: 100 },
              width = 1200 - margin.left - margin.right,
              height = 600 - margin.top - margin.bottom;

        // Append the SVG object to the div
        const svg = d3.select(svgRef.current)
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

        // Parse the data
        const years = monthlyVariance.map(d => d.year);
        const months = Array.from({ length: 12 }, (v, i) => i);

        // Create scales
        const xScale = d3.scaleBand()
          .domain(years)
          .range([0, width]);

        const yScale = d3.scaleBand()
          .domain(months)
          .range([0, height]);

        const colorScale = d3.scaleSequential(d3.interpolateInferno)
          .domain(d3.extent(monthlyVariance, d => baseTemperature + d.variance));

        // Add the x-axis
        const xAxis = d3.axisBottom(xScale)
          .tickValues(xScale.domain().filter(year => year % 10 === 0));
        svg.append('g')
          .attr('transform', `translate(0,${height})`)
          .attr('id', 'x-axis')
          .call(xAxis);

        // Add the y-axis
        const yAxis = d3.axisLeft(yScale)
          .tickFormat(month => d3.timeFormat('%B')(new Date(0).setMonth(month)));
        svg.append('g')
          .attr('id', 'y-axis')
          .call(yAxis);

        // Add the cells
        svg.selectAll('.cell')
          .data(monthlyVariance)
          .enter()
          .append('rect')
          .attr('class', 'cell')
          .attr('x', d => xScale(d.year))
          .attr('y', d => yScale(d.month - 1))
          .attr('width', xScale.bandwidth())
          .attr('height', yScale.bandwidth())
          .attr('data-month', d => d.month - 1)
          .attr('data-year', d => d.year)
          .attr('data-temp', d => baseTemperature + d.variance)
          .style('fill', d => colorScale(baseTemperature + d.variance));

        // Add title and description
        svg.append('text')
          .attr('id', 'title')
          .attr('x', width / 2)
          .attr('y', -margin.top / 2)
          .attr('text-anchor', 'middle')
          .text('Monthly Global Land-Surface Temperature');

        svg.append('text')
          .attr('id', 'description')
          .attr('x', width / 2)
          .attr('y', -margin.top / 2 + 20)
          .attr('text-anchor', 'middle')
          .text('1753 - 2015: base temperature 8.66℃');

        // Add tooltip
        const tooltip = d3.select('body').append('div')
          .attr('id', 'tooltip')
          .style('position', 'absolute')
          .style('visibility', 'hidden')
          .style('background', 'white')
          .style('border', '1px solid black')
          .style('padding', '5px')
          .style('border-radius', '3px');

        svg.selectAll('.cell')
          .on('mouseover', (event, d) => {
            tooltip.style('visibility', 'visible')
                   .attr('data-year', d.year)
                   .html(`Year: ${d.year}<br>Month: ${d3.timeFormat('%B')(new Date(0).setMonth(d.month - 1))}<br>Temperature: ${(baseTemperature + d.variance).toFixed(2)}℃`);
          })
          .on('mousemove', (event) => {
            tooltip.style('left', `${event.pageX + 10}px`)
                   .style('top', `${event.pageY - 28}px`);
          })
          .on('mouseout', () => {
            tooltip.style('visibility', 'hidden');
          });

        // Add legend
        const legend = svg.append('g')
          .attr('id', 'legend')
          .attr('transform', `translate(0,${height + margin.bottom - 40})`);

        const legendWidth = 300,
              legendHeight = 20;

        legend.selectAll('rect')
          .data(d3.range(2.8, 13, (13 - 2.8) / 12))
          .enter()
          .append('rect')
          .attr('x', (d, i) => i * (legendWidth / 12))
          .attr('y', 0)
          .attr('width', legendWidth / 12)
          .attr('height', legendHeight)
          .style('fill', d => colorScale(d));

        legend.append('g')
          .attr('transform', `translate(0,${legendHeight})`)
          .call(d3.axisBottom(d3.scaleLinear()
            .domain([2.8, 13])
            .range([0, legendWidth]))
            .ticks(5));
      });
  }, []);

  return <svg ref={svgRef}></svg>;
};

export default HeatMap;
