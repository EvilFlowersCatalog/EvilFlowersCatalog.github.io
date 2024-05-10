import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const GoalsSvg = () => {
	const containerRef = useRef(null);

	useEffect(() => {
		const svgContainer = d3.select(containerRef.current);
		svgContainer.selectAll("*").remove();

		d3.svg("/img/goals.svg")
			.then(data => {
				const svgElement = data.documentElement;

				svgElement.setAttribute('width', '100%');
				svgElement.setAttribute('height', 'auto');

				svgContainer.node().appendChild(svgElement);
			})
			.catch(error => console.error('Error loading the SVG:', error));
	}, []);

	return <div ref={containerRef} style={{ width: '100%', textAlign: "center" }}></div>;
};

export default GoalsSvg;
