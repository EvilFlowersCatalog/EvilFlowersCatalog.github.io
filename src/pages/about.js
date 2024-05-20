import React from 'react';
import Layout from '@theme/Layout';

const AboutPage = () => {
	return (
		<Layout title="About">
			<div className="container margin-vert--lg">
				<h1>About This Project</h1>
				<div>
					<section>
						<h2>Project Description</h2>
						<p>
							This project focuses on developing open-source tools for a digital academic library. Our primary goal is
							to facilitate the distribution of documents in a manner that is both easy and legally compliant.
							The project began during the COVID-19 pandemic to help students access study materials in a centralized
							and legal way. It continues to be an important resource for students and educators alike.
						</p>
						<p>
							Through this initiative, we aim to create a reliable platform that supports the educational needs of our
							academic community. The tools we develop are maintained by a dedicated team of students and PhD
							candidates, ensuring ongoing improvements and updates.
						</p>
					</section>
					<section>
						<h2>Contact Information</h2>
						<p>If you have any questions or need further information, please contact us at:</p>
						<ul>
							<li>
								<a href="mailto:sik@fiit.stuba.sk">sik [at] fiit.stuba.sk</a>
							</li>
							<li>
								<a href="mailto:jakub.dubec@stuba.sk">jakub.dubec [at] stuba.sk</a>
							</li>
						</ul>
						<p>
							Address: <br/>
							Faculty of Informatics and Information Technologies, <br/>
							Slovak University of Technology, <br/>
							Ilkovičova 2, <br/>
							842 16 Bratislava, <br/>
							Slovakia
						</p>
					</section>
				</div>
			</div>
		</Layout>
	);
};

export default AboutPage;
