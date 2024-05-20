import React from 'react';
import Layout from '@theme/Layout';
import DocumentsTable from '../components/DocumentsTable'; // Adjust the path if necessary

const documents = [
	{
		title: "ELVIRA 2.0 - Popis produktu",
		description: "Features and project goals",
		language: "Slovenčina",
		link: "docs/elvira-description-1-1-0.pdf"
	},
];

const DocumentsPage = () => {
	return (
		<Layout title="Documents">
			<div className="container margin-vert--lg">
				<h1>Documents</h1>
				<DocumentsTable documents={documents} />
			</div>
		</Layout>
	);
};

export default DocumentsPage;
