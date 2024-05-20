import React from 'react';
import Layout from '@theme/Layout';
import { FaGithub, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';
import styles from './projects.module.css';

const projects = [
	{
		title: "ELVIRA Portal",
		description: "The user-interface for students and library staff for accessing, searching and managing information on the document server.",
		image: "/img/portal.png",
		status: "Production Ready"
	},
	{
		title: "EvilFlowersReader",
		description: "EvilFlowersViewer is a PDF viewer based on pdf.js library that allows users to view and interact with PDF documents directly in the browser.",
		image: "/img/reader.png",
		repoLink: "https://github.com/EvilFlowersCatalog/EvilFlowersViewer",
		status: "Production Ready"
	},
	{
		title: "EvilFlowersCatalog",
		description: "A publication catalog server compatible with OPDS 1.2, written in Python with a straightforward management REST API for CRUD operations.",
		image: "/img/evilflowers-logo.png",
		status: "Production Ready",
		repoLink: "https://github.com/EvilFlowersCatalog/EvilFlowersCatalog"
	},
	{
		title: "calibre-evilflowers",
		description: "Calibre plugin for bi-directional sync with EvilFlowersCatalog server ",
		image: "/img/evilflowers-logo.png",
		status: "In Development",
		repoLink: "https://github.com/EvilFlowersCatalog/calibre-evilflowers"
	},
	{
		title: "notion-opds",
		description: "Flask-based OPDS server acting as a proxy to Notion Database, with Redis caching and OPDS Acquisitions and Facets derived from Notion Page properties.",
		image: "/img/evilflowers-logo.png",
		status: "In Development",
		repoLink: "https://github.com/EvilFlowersCatalog/notion-opds"
	},
];

const getStatusIcon = (status) => {
	switch (status) {
		case "Production Ready":
			return <FaCheckCircle className={styles.statusIcon} style={{color: 'green'}} />;
		case "In Development":
			return <FaHourglassHalf className={styles.statusIcon} style={{color: 'orange'}} />;
		default:
			return null;
	}
};

const ProjectsPage = () => {
	return (
		<Layout title="Projects">
			<div className="container">
				<h1 className={styles.title}>Our Projects</h1>
				<div className={styles.projectsGrid}>
					{projects.map((project, index) => (
						<div className={styles.projectCard} key={index}>
							<img src={project.image} alt={`${project.title} screenshot`} className={styles.projectImage} />
							<div className={styles.projectContent}>
								<h2>{project.title}</h2>
								<p>{project.description}</p>
								<table className={styles.projectTable}>
									<tbody>
									<tr>
										<td className={styles.tableHeader}>Status</td>
										<td>{getStatusIcon(project.status)} {project.status}</td>
									</tr>
									{project.repoLink && (
										<tr>
											<td className={styles.tableHeader}>Repository</td>
											<td>
												<a href={project.repoLink} target="_blank" rel="noopener noreferrer">
													<FaGithub className={styles.repoIcon} /> View Repository
												</a>
											</td>
										</tr>
									)}
									</tbody>
								</table>
							</div>
						</div>
					))}
				</div>
			</div>
		</Layout>
	);
};

export default ProjectsPage;
