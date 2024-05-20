import React from 'react';
import Layout from '@theme/Layout';
import { FaGithub, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';
import styles from './projects.module.css';

const projects = [
	{
		title: "Project 1",
		description: "This project focuses on developing a tool for easy document distribution.",
		image: "/img/project1.png",
		repoLink: "https://github.com/project1",
		status: "Production Ready"
	},
	{
		title: "Project 2",
		description: "This project aims to ensure legal compliance in digital document handling.",
		image: "/img/project2.png",
		repoLink: "https://github.com/project2",
		status: "In Development"
	},
	{
		title: "Project 3",
		description: "A project designed to centralize access to study materials.",
		image: "/img/project3.png",
		status: "Production Ready"
	},
	// Add more projects as needed
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
