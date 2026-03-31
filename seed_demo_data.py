import sqlite3
import datetime

def seed():
    conn = sqlite3.connect('data/pao.db')
    cursor = conn.cursor()

    # 1. Clear everything
    tables = [
        'persons', 'organizations', 'relationships', 'relationship_types', 
        'resume_snippets', 'resumes', 'job_opportunities', 'job_profiles',
        'person_organizations', 'person_phones', 'person_social_links', 'job_opportunity_contacts'
    ]
    for t in tables:
        try:
            cursor.execute(f"DELETE FROM {t}")
        except:
            pass

    # 2. Relationship Types
    rt_data = [
        (1, 'BUSINESS', 'Employment link', 'FORWARD', 'WORKS_AT'),
        (2, 'BUSINESS', 'Membership link', 'FORWARD', 'MEMBER_OF'),
        (3, 'PERSONAL', 'Professional colleague', 'BIDIRECTIONAL', 'COLLEAGUE'),
        (4, 'BUSINESS', 'Reporting line', 'FORWARD', 'REPORTS_TO'),
        (5, 'BUSINESS', 'Recruitment / Placement', 'FORWARD', 'RECRUITER')
    ]
    cursor.executemany("INSERT INTO relationship_types (id, category, description, direction, name) VALUES (?,?,?,?,?)", rt_data)

    # 3. Organizations
    org_data = [
        (200, 'San Francisco, CA', 'contact@cloudforge.ai', 'CloudForge AI', '555-0101', 'Leading AI Infrastructure Provider', 'TECH', 'https://cloudforge.ai', None),
        (201, 'Glendale, CA', 'hr@servicetitan.com', 'ServiceTitan', '555-0202', 'Market Leader in Home Service SaaS', 'SAAS', 'https://servicetitan.com', None),
        (202, 'St. Louis, MO', 'info@globalsolutions.com', 'GlobalSolutions Corp', '555-0303', 'Enterprise Strategic Consulting', 'CONSULTING', 'https://globalsolutions.com', None),
        (203, 'Dallas, TX', 'hi@apextalent.com', 'Apex Talent Group', '555-0404', 'Premier Tech Recruiting Agency', 'RECRUITING', 'https://apextalent.com', None)
    ]
    cursor.executemany("INSERT INTO organizations (id, address, email, name, phone, profile_md, type, website, parent_id) VALUES (?,?,?,?,?,?,?,?,?)", org_data)

    # 4. People
    person_data = [
        (100, '123 AI Way, St. Louis, MO', 35, 'Visionary technologist specializing in LLMs and Cloud Infrastructure.', 'john.doe@example.com', 'John', 1, 'Senior AI Solutions Architect', 'Doe', 'https://johndoe.ai'),
        (101, '456 Tech Park, San Francisco, CA', 29, 'HR leader at CloudForge AI.', 'jane.smith@cloudforge.ai', 'Jane', 0, 'Senior Technical Recruiter', 'Smith', None),
        (102, '789 SaaS Blvd, Los Angeles, CA', 45, 'Product engineering veteran.', 'bob.j@servicetitan.com', 'Bob', 0, 'VP of Engineering', 'Johnson', None),
        (103, 'Recruiter Hub, Austin, TX', 32, 'Specializes in placing AI talent in high-growth startups.', 'sarah.j@apextalent.com', 'Sarah', 0, 'Senior Executive Recruiter', 'Jenkins', None),
        (104, 'St. Louis, MO', 48, 'Enterprise transformation leader.', 'm.ward@globalsolutions.com', 'Marcus', 0, 'Director of Engineering', 'Ward', None)
    ]
    cursor.executemany("INSERT INTO persons (id, address, age, description, email, first_name, is_primary, job, last_name, website) VALUES (?,?,?,?,?,?,?,?,?,?)", person_data)

    # 5. Join Tables
    cursor.execute("INSERT INTO person_organizations (person_id, organization_id) VALUES (100, 200)")
    cursor.execute("INSERT INTO person_organizations (person_id, organization_id) VALUES (100, 201)") # Former
    cursor.execute("INSERT INTO person_organizations (person_id, organization_id) VALUES (100, 202)") # Former
    cursor.execute("INSERT INTO person_organizations (person_id, organization_id) VALUES (101, 200)")
    cursor.execute("INSERT INTO person_organizations (person_id, organization_id) VALUES (102, 201)")
    cursor.execute("INSERT INTO person_organizations (person_id, organization_id) VALUES (103, 203)")
    cursor.execute("INSERT INTO person_organizations (person_id, organization_id) VALUES (104, 202)")

    # 6. Relationships
    rel_data = [
        (500, 'COLLEAGUE', None, 100, None, 101),
        (501, 'REPORTS_TO', None, 100, None, 102),
        (502, 'MEMBER_OF', None, 100, 200, None),
        (503, 'RECRUITER', None, 103, None, 100),
        (504, 'WORKS_AT', None, 103, 203, None),
        (505, 'COLLEAGUE', None, 104, None, 100) # Past colleagues
    ]
    cursor.executemany("INSERT INTO relationships (id, type, source_organization_id, source_person_id, target_organization_id, target_person_id) VALUES (?,?,?,?,?,?)", rel_data)

    # 7. Job Profiles
    # id, description, expected_salary, job_type, target_industry, title, work_model, person_id
    cursor.execute("INSERT INTO job_profiles (id, description, expected_salary, job_type, target_industry, title, work_model, person_id) VALUES (?,?,?,?,?,?,?,?)",
                   (1, 'Focus on Staff/Principal AI Engineering roles.', '$250k+', 'Full-Time', 'AI/Tech', 'Principal AI Architect', 'Remote', 100))

    # 8. Resume & Snippets
    cursor.execute("INSERT INTO resumes (id, name, content, person_id) VALUES (?,?,?,?)", 
                   (1, 'John Doe - Executive Tech Leader (2026)', 'Strategic engineering leader with expertise in AI-driven transformation and cloud-native architecture.', 100))
    
    snippet_data = [
        # Work History 1: CloudForge AI
        (1, 
         'Architected the core Vector Search Engine for the PAO Intelligence Hub, enabling sub-100ms semantic search across 500k+ global entities.', 
         'CloudForge AI', '2023-Present', 'AI Core Services Project', 
         'Reduced vector infrastructure costs by 40% using optimized quantization and HNSW indexing strategies. Maintained 99.99% availability.', 
         'Principal AI Architect', 
         'Python, Qdrant, FastAPI, Docker, Kubernetes, GCP', 
         'EXPERIENCE', 100),

        # Work History 2: ServiceTitan
        (2, 
         'Led the multi-region scaling of the Dispatch & Scheduling microservice for the home services SaaS platform.', 
         'ServiceTitan', '2020-2023', 'NextGen Dispatch Scheduler', 
         'Successfully scaled concurrent user capacity from 1k to 10k while reducing database contention by 65%.', 
         'Senior Staff Engineer', 
         'Java 17, Spring Boot, Apache Kafka, PostgreSQL, Redis', 
         'EXPERIENCE', 100),

        # Work History 3: GlobalSolutions Corp
        (3, 
         'Modernized legacy monolithic ERP systems for Fortune 500 clients, migrating them to event-driven architectures on AWS.', 
         'GlobalSolutions Corp', '2015-2020', 'Enterprise Modernization Lab', 
         'Phased out 3 legacy mainframes, saving clients $2M+ in annual maintenance fees through cloud adoption.', 
         'Solutions Architect', 
         'Java, AWS Lambda, SNS/SQS, Terraform, Angular', 
         'EXPERIENCE', 100),

        # Education
        (4, 
         'Focused on Distributed Systems and Machine Learning at scale.', 
         'Stanford University', '2013-2015', 'MS in Computer Science', 
         'Published 3 papers on Federated Learning in the Journal of Artificial Intelligence.', 
         'Masters Student', 
         'C++, PyTorch, Distributed Computing', 
         'EDUCATION', 100),

        # Education 2
        (5, 
         'Dean’s List recipient for 8 consecutive semesters.', 
         'University of Missouri - St. Louis', '2009-2013', 'BS in Computer Science', 
         'Graduated Summa Cum Laude with a minor in Mathematics.', 
         'Undergraduate Student', 
         'Java, Algorithms, Data Structures', 
         'EDUCATION', 100),

        # Certifications
        (6, 
         'Validated expert knowledge of AWS core services, security, and networking.', 
         'Amazon Web Services', '2022', 'AWS Certified Solutions Architect – Professional', 
         'Renewed for advanced practitioner status.', 
         'Certified Professional', 
         'AWS Networking, IAM, Direct Connect', 
         'CERTIFICATION', 100),

        # Header Info (Type: COMMUNICATION is required by Resume Architect service)
        (7, 
         'https://linkedin.com/in/johndoe-ai', 
         'St. Louis, MO', 
         '2026-03-31', 
         'Contact Information Header', 
         'Primary contact record for resume generation.', 
         '555-0199', 
         'Verified Professional', 
         'COMMUNICATION', 100)
    ]
    cursor.executemany("INSERT INTO resume_snippets (id, briefing, company, duration, name, roi, role, technical_stacks, type, person_id) VALUES (?,?,?,?,?,?,?,?,?,?)", snippet_data)

    # 9. Job Opportunities (Leads)
    leads_data = [
        (1001, None, None, 'https://servicetitan.com/jobs/staff-ai', '5+ years AI, Spring Boot, K8s', 'Staff Software Engineer (AI)', 'High priority lead via Bob Johnson.', 'Prepare for scalability architecture questions.', 'INTERVIEWING', 1, 201),
        (1002, 'apply-portal-login', 'https://globalsolutions.com/careers', 'https://job.url/director-ai', 'Lead AI transformation strategy.', 'Director of Cloud Architecture', 'Automated application submitted.', 'Review their Q1 earnings report.', 'APPLIED', 1, 202),
        (1003, None, None, 'https://cloudforge.ai/jobs/research', 'Advanced NLP research.', 'AI Research Lead', 'Internal transfer possibility.', 'Discuss with Jane Smith.', 'TARGET', 1, 200)
    ]
    cursor.executemany("INSERT INTO job_opportunities (id, application_login_info, application_login_url, job_posting_url, job_requirements, job_title, notes, preparation_note, status, job_profile_id, organization_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)", leads_data)

    conn.commit()
    conn.close()
    print("Demo data seeded successful for John Doe!")

if __name__ == "__main__":
    seed()
