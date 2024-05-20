import React from 'react';
import PropTypes from 'prop-types';
import styles from './DocumentsTable.module.css'; // You'll need to create CSS for your table styling if you want custom styles

const DocumentsTable = ({ documents }) => {
	return (
		<table className={styles.table}>
			<thead>
			<tr>
				<th>Title</th>
				<th>Description</th>
				<th>Language</th>
				<th>Link</th>
			</tr>
			</thead>
			<tbody>
			{documents.map((doc, index) => (
				<tr key={index}>
					<td>{doc.title}</td>
					<td>{doc.description}</td>
					<td>{doc.language}</td>
					<td><a href={doc.link} target="_blank" rel="noopener noreferrer">View Document</a></td>
				</tr>
			))}
			</tbody>
		</table>
	);
};

DocumentsTable.propTypes = {
	documents: PropTypes.arrayOf(
		PropTypes.shape({
			title: PropTypes.string.isRequired,
			description: PropTypes.string.isRequired,
			language: PropTypes.string.isRequired,
			link: PropTypes.string.isRequired
		})
	).isRequired
};

export default DocumentsTable;
