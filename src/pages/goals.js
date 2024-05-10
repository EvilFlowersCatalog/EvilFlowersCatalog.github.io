import React from 'react';
import Layout from '@theme/Layout';

import GoalsSvg from '../components/GoalsComponent';

export default function Goals() {
	return (
		<Layout title="Goals & Roadmap" description="Projects goals are currently just presented as the mind map bellow">
			<div className="container margin-vert--lg">
				<h1>Goals & Roadmap</h1>
			</div>
			<div>
				<GoalsSvg/>
			</div>
		</Layout>
	);
}