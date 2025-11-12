import React from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/docs/quick-start"
          >
            Get Started
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/docs/intro"
          >
            Learn More
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="Comprehensive web accessibility tracking system for ICJIA"
    >
      <HomepageHeader />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              <div className="col col--4">
                <Link to="/docs/docs/intro" className={styles.featureLink}>
                  <div className={styles.featureBox}>
                    <h3>📊 Real-time Scores</h3>
                    <p>
                      Monitor accessibility scores for all ICJIA web properties
                      in real-time.
                    </p>
                  </div>
                </Link>
              </div>
              <div className="col col--4">
                <Link to="/docs/docs/intro" className={styles.featureLink}>
                  <div className={styles.featureBox}>
                    <h3>📈 Track Progress</h3>
                    <p>
                      View historical trends and improvements toward April 2026
                      compliance goals.
                    </p>
                  </div>
                </Link>
              </div>
              <div className="col col--4">
                <Link to="/docs/docs/intro" className={styles.featureLink}>
                  <div className={styles.featureBox}>
                    <h3>🔐 Secure Admin</h3>
                    <p>
                      Manage sites, users, and API keys with a secure
                      authentication system.
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
