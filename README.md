## LinkedIn Profile Search Mass Scraper

Our powerful tool helps you search all LinkedIn Profiles and filter by companies, job titles, locations, and more without compromising security or violating platform policies. This Actor can find and scrape nearly everyone on LinkedIn. The number of possible results to extract is much bigger than with other actors.

### Other LinkedIn Profile Search Scrapers:

- For searching by **keywords without filters**, consider using our [LinkedIn Profile Search by services Actor](https://apify.com/harvestapi/linkedin-profile-search-by-services). It's cheaper, doesn't apply rate limits, and can be used at a larger scale. The drawback is that it doesn't support many filters and may find fewer profiles.
- For searches by a person's **full name**, we recommend using our [Profile Search by name](https://apify.com/harvestapi/linkedin-profile-search-by-name) Actor instead.
- For scraping profiles by profile URLs, please use our [Linkedin Profile Scraper](https://apify.com/harvestapi/linkedin-profile-scraper).
- Find more LinkedIn scraping actors [https://apify.com/harvestapi](https://apify.com/harvestapi).

## How It Works

1. Choose Profile Scraper Mode

- **Short**: The Actor will scrape only **search pages** and will output only **basic profile data**. One search page yields up to 25 results (**short profiles**). The actor will charge **\$0.10 per search page**, regardless of how many profiles were found on the page. It will not charge for short profiles additionally.
- **Full**: In addition to scraping search pages, it will open the profile link for each short profile found on the search page and scrape **all profile details** as well. The actor will charge **\$0.10 per search page + \$0.004 per each full profile scraped**.
- **Full + email search**: In addition to Full profiles, it will attempt to find **email addresses** for the profiles. **See details below**. The actor will charge **\$0.10 per search page + \$0.01 per each full profile scraped with email search performed**.

2. Provide any combination of the following search parameters to find LinkedIn profiles:

- General search query (fuzzy search). (e.g., `Founder`, `Marketing Manager`, `John Doe`). [The query supports operators](https://www.linkedin.com/help/linkedin/answer/a524335)
- List of current Job titles (exact search) (e.g., `Marketing Manager`, `Data Scientist`)
- List of past Job titles (exact search) (e.g., `Marketing Manager`, `Data Scientist`)
- List of locations where they currently live (e.g., `New York`, `San Francisco`, `London`). Please note that LinkedIn does not always understand your text queries. For example for "UK" query it will apply "Ukraine" location, so you should use "United Kingdom" in this case. Try this out first in the location filter input of LinkedIn search at `https://www.linkedin.com/search/results/people/?geoUrn=%5B%22103644278%22%5D` - we will use the first suggestion from the autocomplete popup when you type your location.
- List of LinkedIn Company URLs where they currently work (e.g., `google`, `meta`, `amazon`)
- List of LinkedIn Company URLs where they previously worked (e.g., `google`, `meta`, `amazon`)
- List of LinkedIn School URLs where they studied (e.g., `stanford-university`, `MIT`)
- List of LinkedIn industry IDs (only numbers). You can find the full list of LinkedIn industry IDs in the [LinkedIn Industries](https://github.com/HarvestAPI/linkedin-industry-codes-v2/blob/main/linkedin_industry_code_v2_all_eng_with_header.csv). For example, `4` is "Software Development", `43` is "Financial Services", etc.
- List of total years of experience.
- List of years at the current company.

Other params (optionally):

- `startPage` - The page number to start scraping from. Default is 1.
- `takePages` - The number of pages to scrape. One page is up to 25 results. Maximum is 100 pages (LinkedIn limitation).
- `maxItems` - Maximum number of profiles to scrape for all queries. If you set to 0, it will scrape all available items or up to 2500 items per search query. LinkedIn doesn't allow to extract more than 2500 per one query.

#### Email search

By selecting the "Full + email search" mode, you can enable our tool to perform email search for LinkedIn profiles, which is ideal for lead generation, recruitment, and networking. We perform comprehensive validation checks, including SMTP checks, to ensure the email addresses are valid and deliverable. Adaptive cost: if a LinkedIn profile is not complete enough to perform the email search - we will not charge you for the search.  
Important Note: The scraper cannot extract emails directly from a LinkedIn profile as this information is not publicly available on the platform. The email search is performed independently and **it is not guaranteed to find an email for every profile.**

3. Run the Actor

The Actor will print in the how many profiles in total were found for your query. If the total is more than 2500, you won't be able to extract all results. Consider splitting your query into multiple queries applying more filters. For example do multiple runs for locations of specific cities, instead of one run targeting entire country or region.

### Pagination

If you scraped a query partially and want to continue later, you can start a new run from the last scraped search page. Check the Actor's logs and find the last line like this: `Scraped search page 10. Found 25 profiles on the page.`. Or check the last result
in the dataset, each profile contains the pagination info under `_meta` field, the last page will be under `_meta.pagination.pageNumber`.

Start a new run with specifying the next `startPage` in the input:

```json
{
  "searchQuery": "Machine Learning Engineer",
  "profileScraperMode": "Full",
  "startPage": 11
}
```

The pagination info also contains the total number of profiles on LinkedIn for your query under `_meta.pagination.totalElements`.

### Data You'll Receive

- Profile summary and headline
- Current and previous work experience
- Educational qualifications
- Location and contact information
- Skills and endorsements
- Recommendations and connections
- Certifications and projects

### Sample output data

Here is the example profile output of this actor:

```json
{
  "id": "ACoAACLevxsBfWQoDUYkHyCP2jzl81cDAvckQEI",
  "publicIdentifier": "towhid-rahman",
  "linkedinUrl": "https://www.linkedin.com/in/towhid-rahman",
  "firstName": "Towhid",
  "lastName": "Rahman, PharmD",
  "headline": "Pharmacology | Medical Science Liasion | Pharmacovigilence | Regulatory Toxicologist | Process Validation | Project Management | Leadership | Photography",
  "about": "I find myself at a unique crossroads where science meets compassion. With over eight years of experience in pharmacology, my journey has been fueled by a genuine desire to improve patient lives. Working at CVS Health has allowed me to interact with over 100 patients each week, guiding them through their health journeys not just by dispensing medications but by truly listening and building trust. It's incredibly rewarding to know I play a part in their well-being.\n\nIn my time as a Staff Pharmacist, I’ve exceeded daily production targets by 15% while ensuring timely service for more than 1,000 patients weekly. Collaborating with diverse pharmacy teams across Los Angeles has taught me the importance of understanding unique demographic needs. Whether it’s addressing medication safety or enhancing patient satisfaction through targeted counseling initiatives, I’m dedicated to creating solutions that resonate.\n\nOne of my proudest moments was during my internship at Harbor-UCLA Medical Center when I administered over 1,500 immunizations. This experience opened my eyes to the impact preventive healthcare can have on communities. By conducting health screenings and engaging patients directly about disease management education, I contributed to improved public health outcomes—something that drives me every day.\n\nOutside of my professional life, I have a passion for photography. This hobby allows me to express my creativity while honing my attention to detail—skills that translate seamlessly into my work. Capturing moments behind the lens reminds me how important it is to appreciate the little things in life.\n\nIf you're interested in discussing innovative approaches in product development or project management within the healthcare field—or if you simply want to chat about photography—I would love to connect! Feel free to reach out via email—let’s explore how we can make an impact together.\n\nSkills:\n- Patient Care Management\n- Medication Optimization\n- Process Validation\n- Project Management\n- Drug Utilization Review",
  "openToWork": false,
  "hiring": false,
  "photo": "https://media.licdn.com/dms/image/v2/C5603AQEbgBlEFwrtUg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1567218693232?e=1756944000&v=beta&t=duzOKV11a_IbPCE_7FCXqaTh1O6Q1TR7IZmpGEmxGAE",
  "premium": false,
  "influencer": false,
  "location": {
    "linkedinText": "Los Angeles, California, United States",
    "countryCode": "US",
    "parsed": {
      "text": "Los Angeles, CA, United States",
      "countryCode": "US",
      "regionCode": null,
      "country": "United States",
      "countryFull": "United States of America",
      "state": "California",
      "city": "Los Angeles"
    }
  },
  "verified": true,
  "registeredAt": "2017-07-29T17:39:39.165Z",
  "topSkills": "Pharmacology • Patient Counseling",
  "connectionsCount": 261,
  "followerCount": 264,
  "currentPosition": [
    {
      "companyName": "CVS Health"
    }
  ],
  "experience": [
    {
      "position": "Staff Pharmacist | Prescription Dispensing, Drug Utilization Review, Regulatory Compliance",
      "location": "Thousand Oaks, California, United States",
      "employmentType": "Full-time",
      "workplaceType": "On-site",
      "companyName": "CVS Health",
      "companyLinkedinUrl": "https://www.linkedin.com/company/cvshealth/",
      "companyId": "4680",
      "companyUniversalName": "cvshealth",
      "duration": "1 yr 7 mos",
      "description": "*Exceeded daily production targets by 15% in a high-demand pharmacy environment while ensuring timely service delivery to over 1000 patients each week without compromising quality or accuracy.\n\n* Managed multiple priorities simultaneously by implementing efficient workflow strategies that significantly reduced prescription processing time by 20%, enhancing overall patient satisfaction scores.\n\n* Conducted comprehensive drug utilization reviews utilizing AI-driven tools to identify potential safety concerns, leading to a 30% reduction in adverse drug interactions reported among patients.\n\n* Delivered expert patient counseling on medication usage and interactions for over 50 individuals weekly, improving adherence rates by approximately 25% through personalized education efforts.\n\n* Executed state and federal controlled substance dispensing audits with zero discrepancies found, ensuring strict compliance with regulatory standards while proactively preventing misuse or fraud.",
      "skills": [
        "Scientific Liaison",
        "Cultural Awareness",
        "Resource Optimization",
        "Active Listening",
        "Certified Immunizer",
        "Interpersonal Communication",
        "Medication Dispensing",
        "Regulatory Compliance"
      ],
      "startDate": {
        "month": "Jan",
        "year": 2024,
        "text": "Jan 2024"
      },
      "endDate": {
        "text": "Present"
      }
    },
    {
      "position": "Support Pharmacist | Patient Care Management, Medication Optimization, Healthcare Collaboration",
      "location": "Los Angeles, California, United States",
      "employmentType": "Full-time",
      "workplaceType": "On-site",
      "companyName": "CVS Health",
      "companyLinkedinUrl": "https://www.linkedin.com/company/cvshealth/",
      "companyId": "4680",
      "companyUniversalName": "cvshealth",
      "duration": "1 yr 2 mos",
      "description": "* Collaborated with over 30 diverse pharmacy teams across various locations to address unique demographic needs and overcome specific challenges in each community, enhancing service delivery by 25%.\n\n* Mentored pharmacy technicians and trained new staff members to promote teamwork and operational efficiency, reducing onboarding time by 40% through streamlined training processes.\n\n* Evaluated drug storage conditions and optimized handling procedures to maintain medication efficacy while ensuring colleague safety; achieved a compliance rate of 98% during inspections.\n\n* Assisted patients with insurance issues by providing affordable alternatives and encouraging adherence through proactive follow-ups; increased patient adherence rates by 20% over the year.",
      "skills": [
        "Healthcare System Knowledge",
        "Drug Utilization Review",
        "Cardiopulmonary Resuscitation (CPR)",
        "Project Management",
        "Medication Adherence",
        "Collaborative Problem Solving",
        "Scientific Communications",
        "Basic Life Support (BLS)",
        "Medical Terminology",
        "Drug Interactions",
        "Professional Networking",
        "Healthcare Compliance",
        "Drug Therapy Optimization",
        "Medication Safety"
      ],
      "startDate": {
        "month": "Nov",
        "year": 2022,
        "text": "Nov 2022"
      },
      "endDate": {
        "month": "Dec",
        "year": 2023,
        "text": "Dec 2023"
      }
    },
    {
      "position": "Intern Pharmacist | Immunization Administration, Patient Counseling, Medication Safety",
      "location": "Los Angeles, California, United States",
      "employmentType": "Part-time",
      "workplaceType": "On-site",
      "companyName": "CVS Health",
      "companyLinkedinUrl": "https://www.linkedin.com/company/cvshealth/",
      "companyId": "4680",
      "companyUniversalName": "cvshealth",
      "duration": "4 yrs 1 mo",
      "description": "* Administered over 1,500 immunizations during tenure, significantly enhancing community access to preventive healthcare services and contributing to improved public health outcomes in Los Angeles.\n\n* Conducted health screenings for more than 2,000 patients, providing tailored wellness advice that promoted lifestyle modifications such as smoking cessation and weight management for long-term health benefits.\n\n* Meticulously reviewed prescribers' information (USPI) and medication guides to identify potential drug safety concerns. Educated over 100 patients weekly on safe medication use practices and enhanced their understanding of treatment plans.\n\n* Delivered evidence-based recommendations on medication allergies and interactions that addressed patient-specific concerns, resulting in a notable reduction in adverse drug events within the community.\n\n* Collaborated with pharmacy teams to manage inventory effectively, ensuring accurate stock levels which minimized waste from expired medications by 30% during the internship period.\n\n* Organized medication adherence programs that included refill reminders for over 200 patients monthly, successfully resolving insurance-related access challenges that improved overall patient satisfaction.",
      "skills": ["Retail", "Patient Counseling", "OTC", "Immunization", "Medication Safety"],
      "startDate": {
        "month": "Nov",
        "year": 2018,
        "text": "Nov 2018"
      },
      "endDate": {
        "month": "Nov",
        "year": 2022,
        "text": "Nov 2022"
      }
    },
    {
      "position": "Certified Pharmacy Technician | Prescription Dispensing, Inventory Management, HIPAA Compliance",
      "location": "Los Angeles, California, United States",
      "employmentType": "Part-time",
      "workplaceType": "On-site",
      "companyName": "CVS Health",
      "companyLinkedinUrl": "https://www.linkedin.com/company/cvshealth/",
      "companyId": "4680",
      "companyUniversalName": "cvshealth",
      "duration": "3 yrs 3 mos",
      "description": "* Processed over 500 medication orders weekly by accurately labeling prescriptions and verifying dosage instructions, ensuring a 98% accuracy rate in medication dispensing and reducing patient wait times significantly.\n\n* Managed inventory levels by conducting regular checks and placing timely orders that resulted in a 30% reduction in expired products, thereby maintaining compliance with safety regulations and optimizing operational efficiency.\n\n* Conducted insurance verifications and claims processing for patients which streamlined prescription fulfillment processes, leading to a decrease in processing delays by 25% and enhancing patient satisfaction scores.\n\n* Ensured adherence to HIPAA regulations by safeguarding patient information during interactions and transactions, contributing to the pharmacy’s reputation for confidentiality and trustworthiness within the community.\n\n* Supported pharmacists in managing medication recalls effectively while performing quality control checks on medications to uphold safety standards for all patients served at the pharmacy.",
      "skills": [
        "Retail",
        "Healthcare System Knowledge",
        "Customer Service",
        "Teamwork",
        "U.S. Health Insurance Portability and Accountability Act (HIPAA)",
        "Insurance Billing",
        "Time Management"
      ],
      "startDate": {
        "month": "Sep",
        "year": 2015,
        "text": "Sep 2015"
      },
      "endDate": {
        "month": "Nov",
        "year": 2018,
        "text": "Nov 2018"
      }
    },
    {
      "position": "Intern Pharmacist | Health-Systems Ambulatory Care, Evidence-Based Therapy, Clinical Research",
      "location": "California, United States",
      "employmentType": "Internship",
      "workplaceType": "Hybrid",
      "companyName": "VA Greater Los Angeles Healthcare System",
      "companyLinkedinUrl": "https://www.linkedin.com/search/results/all/?keywords=VA+Greater+Los+Angeles+Healthcare+System",
      "duration": "5 mos",
      "description": "* Analyzed over 100 patients’ medical charts to identify high-risk individuals for cardiovascular diseases, significantly improving targeted therapy recommendations and enhancing patient outcomes in the cardiology department.\n\n* Organized and facilitated cardiology clinics that increased patient throughput by 30%, ensuring timely access to essential healthcare services for veterans while collaborating with a multidisciplinary team.\n\n* Completed a comprehensive project on ‘Essential and Evidence-based Cardiovascular Disease Medicine Availability in Low-Cost Generic Drug Plans’, culminating in a poster presentation that informed hospital policy on medication accessibility.",
      "skills": [
        "High-quality Actionable Insight",
        "Peer Relationships",
        "Healthcare System Knowledge",
        "Drug Utilization Review",
        "Clinical Research",
        "Data Analysis",
        "Project Management",
        "Research Proposals",
        "Collaborative Problem Solving",
        "Public Speaking",
        "Literature Reviews",
        "Scientific Discussion",
        "Research Skills",
        "Scientific Communications",
        "Presentation Skills",
        "Relationship Building",
        "Professional Networking",
        "Collaboration in Healthcare"
      ],
      "startDate": {
        "month": "Jan",
        "year": 2022,
        "text": "Jan 2022"
      },
      "endDate": {
        "month": "May",
        "year": 2022,
        "text": "May 2022"
      }
    },
    {
      "position": "Intern Pharmacist | Ambulatory Care,  Patient Education, Disease Management",
      "location": "California, United States",
      "employmentType": "Internship",
      "workplaceType": "Hybrid",
      "companyName": "Harbor-UCLA Medical Center",
      "companyLinkedinUrl": "https://www.linkedin.com/company/38115891/",
      "companyId": "38115891",
      "duration": "2 mos",
      "description": "* Implemented guideline-recommended drug therapy for diabetes and hyperlipidemia patients, positively impacting treatment adherence and health outcomes for a diverse patient population.\n\n* Conducted comprehensive patient interviews focused on disease management education, successfully enhancing patient understanding of their conditions and promoting healthier lifestyle choices.\n\n* Collaborated with healthcare teams to optimize medication regimens, ensuring safe and effective pharmacotherapy aligned with the latest clinical guidelines.\n\n* Documented patient interactions and outcomes meticulously, contributing to improved continuity of care and accurate health records for future reference.",
      "skills": [
        "High-quality Actionable Insight",
        "Peer Relationships",
        "Healthcare System Knowledge",
        "Drug Utilization Review",
        "Scientific Discussion",
        "Scientific Communications",
        "Presentation Skills",
        "Relationship Building",
        "Professional Networking"
      ],
      "startDate": {
        "month": "Nov",
        "year": 2021,
        "text": "Nov 2021"
      },
      "endDate": {
        "month": "Dec",
        "year": 2021,
        "text": "Dec 2021"
      }
    },
    {
      "position": "Intern Pharmacist | General Medicine, Medication Management, Clinical Analysis",
      "location": "California, United States",
      "employmentType": "Internship",
      "workplaceType": "On-site",
      "companyName": "Olive View-UCLA Medical Center",
      "companyLinkedinUrl": "https://www.linkedin.com/company/62210181/",
      "companyId": "62210181",
      "duration": "3 mos",
      "description": "* Participated in daily medical rounds with interdisciplinary teams, delivering medication recommendations that enhanced patient care strategies and improved overall treatment outcomes for diverse patient populations.\n\n* Analyzed over 100 patient medical records to identify critical red flags, leading to tailored treatment plans that significantly improved medication adherence and therapeutic effectiveness for patients in a hospital setting.\n\n* Collaborated with healthcare professionals to ensure accurate medication management, contributing to a streamlined process that reduced potential drug interactions and optimized patient safety during hospital stays.",
      "skills": [
        "High-quality Actionable Insight",
        "Peer Relationships",
        "Healthcare System Knowledge",
        "Collaborative Problem Solving",
        "Scientific Discussion",
        "Scientific Communications",
        "Presentation Skills",
        "Relationship Building",
        "Professional Networking"
      ],
      "startDate": {
        "month": "Sep",
        "year": 2021,
        "text": "Sep 2021"
      },
      "endDate": {
        "month": "Nov",
        "year": 2021,
        "text": "Nov 2021"
      }
    },
    {
      "position": "Intern Pharmacist | Transitional Care, Medication Reconciliation, Guideline Directed Therapy",
      "location": "California, United States",
      "employmentType": "Internship",
      "workplaceType": "On-site",
      "companyName": "Olive View-UCLA Medical Center",
      "companyLinkedinUrl": "https://www.linkedin.com/company/62210181/",
      "companyId": "62210181",
      "duration": "2 mos",
      "description": "* Participated in the admission and discharge medication reconciliation process for over 50 patients weekly, ensuring accurate medication lists to enhance patient safety and continuity of care.\n\n* Delivered comprehensive patient discharge counseling sessions that improved understanding of medication regimens, leading to a 30% reduction in post-discharge complications among patients.\n\n* Analyzed clinical data to provide evidence-based recommendations for Guideline Directed Medication Therapy, optimizing treatment plans for diverse patient populations.",
      "skills": [
        "Drug Utilization Review",
        "Collaborative Problem Solving",
        "Scientific Discussion",
        "Relationship Building"
      ],
      "startDate": {
        "month": "Aug",
        "year": 2021,
        "text": "Aug 2021"
      },
      "endDate": {
        "month": "Sep",
        "year": 2021,
        "text": "Sep 2021"
      }
    },
    {
      "position": "Intern Pharmacist | Health-Systems Practice, Expired Medication Management, Financial Analysis",
      "location": "California, United States",
      "employmentType": "Internship",
      "workplaceType": "On-site",
      "companyName": "Olive View-UCLA Medical Center",
      "companyLinkedinUrl": "https://www.linkedin.com/company/62210181/",
      "companyId": "62210181",
      "duration": "3 mos",
      "description": "* Analyzed hospital pharmacy operations to identify inefficiencies, contributing to a 15% improvement in workflow efficiency during the internship period through targeted recommendations for process enhancements.\n\n* Actively participated in the identification and handling of expired medications, successfully reducing potential financial losses by approximately $10,000 through improved inventory management practices.\n\n* Completed a comprehensive project on expired medication management that provided actionable insights to the management team, leading to the implementation of new protocols for medication oversight.",
      "skills": [
        "Peer Relationships",
        "Healthcare System Knowledge",
        "Drug Utilization Review",
        "Public Speaking",
        "Scientific Discussion",
        "Scientific Communications",
        "Relationship Building"
      ],
      "startDate": {
        "month": "Jun",
        "year": 2021,
        "text": "Jun 2021"
      },
      "endDate": {
        "month": "Aug",
        "year": 2021,
        "text": "Aug 2021"
      }
    },
    {
      "position": "Application Scientist | Particle Size Analysis, Pharmaceutical Consultation, Training Development",
      "location": "Dhaka, Bangladesh",
      "employmentType": "Full-time",
      "workplaceType": null,
      "companyName": "Bio-Xin Pvt. Ltd.",
      "companyLinkedinUrl": "https://www.linkedin.com/search/results/all/?keywords=Bio-Xin+Pvt%2E+Ltd%2E",
      "duration": "1 yr 8 mos",
      "description": "* Delivered expert consultation to over 50 pharmaceutical clients on drug particle size analysis, significantly enhancing their understanding of its impact on drug efficacy and performance metrics.\n\n* Conducted 15+ training sessions and workshops tailored to client needs, improving the operational proficiency of advanced particle size analysis systems for metered-dose inhalers and nasal sprays.\n\n* Collaborated with global cross-functional teams, including pharmaceutical companies and equipment manufacturers, driving innovation that resulted in a 30% increase in product quality standards across projects.\n\n* Developed customized training materials that addressed specific client challenges, leading to a 25% improvement in client satisfaction ratings regarding product performance and usability.",
      "skills": [
        "Product Marketing",
        "Customer Engagement",
        "Project Management",
        "Client Relations",
        "Public Speaking",
        "Scientific Communications",
        "Presentation Skills",
        "Relationship Building",
        "Drug Particle Size Analysis",
        "Pharmaceutical Industry Consultation",
        "Training Development",
        "Cross-Functional Collaboration"
      ],
      "startDate": {
        "month": "Sep",
        "year": 2011,
        "text": "Sep 2011"
      },
      "endDate": {
        "month": "Apr",
        "year": 2013,
        "text": "Apr 2013"
      }
    }
  ],
  "education": [
    {
      "schoolName": "Western University of Health Sciences",
      "schoolLinkedinUrl": "https://www.linkedin.com/company/26345/",
      "degree": "Doctor of Pharmacy",
      "fieldOfStudy": "Pharmacy",
      "skills": [
        "Healthcare System Knowledge",
        "Relationship Building",
        "Pharmacodynamics",
        "Scientific Communications",
        "Cross-functional Team Leadership",
        "Research Skills",
        "Professional Networking",
        "Expense Reports",
        "Presentation Skills",
        "Laboratory Skills",
        "Scientific Discussion",
        "Medical Terminology",
        "Collaborative Problem Solving",
        "Public Speaking",
        "Clinical Trials",
        "Drug Utilization Review",
        "Pharmacology",
        "Data Analysis",
        "Project Management"
      ],
      "startDate": {
        "month": "Aug",
        "year": 2018,
        "text": "Aug 2018"
      },
      "endDate": {
        "month": "May",
        "year": 2022,
        "text": "May 2022"
      },
      "period": "Aug 2018 - May 2022"
    },
    {
      "schoolName": "KTH Royal Institute of Technology",
      "schoolLinkedinUrl": "https://www.linkedin.com/company/4814/",
      "degree": "Master of Science",
      "fieldOfStudy": "Biotechnology",
      "skills": [
        "Scientific Communications",
        "Cross-functional Team Leadership",
        "Research Skills",
        "Professional Networking",
        "Presentation Skills",
        "Laboratory Skills",
        "Scientific Discussion",
        "Collaborative Problem Solving",
        "Public Speaking",
        "Clinical Research",
        "Data Analysis",
        "Project Management",
        "Literature Reviews"
      ],
      "startDate": {
        "month": "Aug",
        "year": 2007,
        "text": "Aug 2007"
      },
      "endDate": {
        "month": "Jan",
        "year": 2011,
        "text": "Jan 2011"
      },
      "period": "Aug 2007 - Jan 2011"
    },
    {
      "schoolName": "Khulna University",
      "schoolLinkedinUrl": "https://www.linkedin.com/company/9537234/",
      "degree": "Bachelor of Science",
      "fieldOfStudy": "Biotechnology and Genetic Engineering",
      "skills": [
        "Scientific Communications",
        "Cross-functional Team Leadership",
        "Professional Networking",
        "Presentation Skills",
        "Laboratory Skills",
        "Scientific Discussion",
        "Public Speaking",
        "Data Analysis",
        "Project Management"
      ],
      "startDate": {
        "month": "Aug",
        "year": 2001,
        "text": "Aug 2001"
      },
      "endDate": {
        "month": "May",
        "year": 2005,
        "text": "May 2005"
      },
      "period": "Aug 2001 - May 2005"
    },
    {
      "schoolName": "Los Angeles Pierce College",
      "schoolLinkedinUrl": "https://www.linkedin.com/company/231552/",
      "degree": "Associate of Science",
      "fieldOfStudy": null,
      "skills": [
        "Cross-functional Team Leadership",
        "Professional Networking",
        "Presentation Skills",
        "Laboratory Skills",
        "Scientific Discussion",
        "Collaborative Problem Solving",
        "Public Speaking",
        "Data Analysis",
        "Project Management"
      ],
      "startDate": {
        "year": 2015,
        "text": "2015"
      },
      "endDate": {
        "year": 2018,
        "text": "2018"
      },
      "period": "2015 - 2018"
    }
  ],
  "certifications": [
    {
      "title": "Excel Essential Training (Microsoft 365)",
      "issuedAt": "Issued Sep 2023",
      "issuedBy": "LinkedIn",
      "issuedByLink": "https://www.linkedin.com/company/1337/"
    },
    {
      "title": "Excel Formulas and Functions Quick Tips",
      "issuedAt": "Issued Sep 2023",
      "issuedBy": "LinkedIn",
      "issuedByLink": "https://www.linkedin.com/company/1337/"
    }
  ],
  "projects": [
    {
      "title": "Essential and Evidence-Based Cardiovascular Disease Medicine Availability in Low-Cost Generic Drug Plans",
      "description": "The project estimated the availability of essential and guideline-recommended cardiovascular medicines in low-cost generic drug programs in the United States.",
      "duration": "Jan 2022 - May 2022",
      "startDate": {
        "month": "Jan",
        "year": 2022,
        "text": "Jan 2022"
      },
      "endDate": {
        "month": "May",
        "year": 2022,
        "text": "May 2022"
      }
    },
    {
      "title": "Androgen Mediated Inhibition of STAT3 Phosphorylation and Lipogenesis in Liver",
      "description": "The study demonstrated that testosterone-mediated inhibition of pSTAT3 may contribute to the lipogenic gene expression in the liver.",
      "duration": "Apr 2009 - Nov 2009",
      "startDate": {
        "month": "Apr",
        "year": 2009,
        "text": "Apr 2009"
      },
      "endDate": {
        "month": "Nov",
        "year": 2009,
        "text": "Nov 2009"
      }
    }
  ],
  "volunteering": [
    {
      "role": "Patient Screening Volunteer",
      "duration": "Mar 2019 · 1 mo",
      "startDate": null,
      "endDate": {
        "month": "Mar",
        "year": 2019,
        "text": "Mar 2019 · 1 mo"
      },
      "organizationName": "Korean Student Association",
      "organizationLinkedinUrl": null,
      "cause": "Health"
    },
    {
      "role": "Immunizer",
      "duration": "Mar 2019 · 1 mo",
      "startDate": null,
      "endDate": {
        "month": "Mar",
        "year": 2019,
        "text": "Mar 2019 · 1 mo"
      },
      "organizationName": "California Society of Health - System Pharmacists",
      "organizationLinkedinUrl": "https://www.linkedin.com/company/57634469/",
      "cause": "Health"
    }
  ],
  "receivedRecommendations": [],
  "skills": [
    {
      "name": "Drug Therapy Optimization",
      "positions": [
        "Support Pharmacist | Patient Care Management, Medication Optimization, Healthcare Collaboration at CVS Health"
      ]
    },
    {
      "name": "Medication Safety",
      "positions": ["2 experiences at CVS Health"]
    },
    {
      "name": "Drug Particle Size Analysis"
    },
    {
      "name": "Pharmaceutical Industry Consultation"
    },
    {
      "name": "Training Development"
    },
    {
      "name": "Cross-Functional Collaboration"
    },
    {
      "name": "Medication Dispensing",
      "positions": [
        "Staff Pharmacist | Prescription Dispensing, Drug Utilization Review, Regulatory Compliance at CVS Health"
      ]
    },
    {
      "name": "Regulatory Compliance",
      "positions": [
        "Staff Pharmacist | Prescription Dispensing, Drug Utilization Review, Regulatory Compliance at CVS Health"
      ]
    },
    {
      "name": "Cultural Awareness",
      "positions": [
        "Staff Pharmacist | Prescription Dispensing, Drug Utilization Review, Regulatory Compliance at CVS Health"
      ]
    },
    {
      "name": "Resource Optimization",
      "positions": [
        "Staff Pharmacist | Prescription Dispensing, Drug Utilization Review, Regulatory Compliance at CVS Health"
      ]
    },
    {
      "name": "Active Listening",
      "positions": [
        "Staff Pharmacist | Prescription Dispensing, Drug Utilization Review, Regulatory Compliance at CVS Health"
      ]
    },
    {
      "name": "Workload Prioritization"
    },
    {
      "name": "Certified Immunizer",
      "positions": [
        "Staff Pharmacist | Prescription Dispensing, Drug Utilization Review, Regulatory Compliance at CVS Health"
      ],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Interpersonal Communication",
      "positions": [
        "Staff Pharmacist | Prescription Dispensing, Drug Utilization Review, Regulatory Compliance at CVS Health"
      ]
    },
    {
      "name": "Scientific Liaison",
      "positions": [
        "Staff Pharmacist | Prescription Dispensing, Drug Utilization Review, Regulatory Compliance at CVS Health"
      ]
    },
    {
      "name": "Management"
    },
    {
      "name": "Healthcare System Knowledge",
      "positions": [
        "6 experiences across CVS Health and 3 other companies",
        "Western University of Health Sciences"
      ]
    },
    {
      "name": "Cross-functional Team Leadership",
      "positions": [
        "4 educational experiences at Western University of Health Sciences and 3 other schools"
      ]
    },
    {
      "name": "Customer Engagement"
    },
    {
      "name": "High-quality Actionable Insight"
    },
    {
      "name": "Scientific Discussion",
      "positions": [
        "4 educational experiences at Western University of Health Sciences and 3 other schools"
      ]
    },
    {
      "name": "Scientific Communications",
      "positions": [
        "6 experiences across CVS Health and 4 other companies",
        "3 educational experiences at Western University of Health Sciences and 2 other schools"
      ]
    },
    {
      "name": "Relationship Building",
      "positions": ["Western University of Health Sciences"]
    },
    {
      "name": "Professional Networking",
      "positions": [
        "4 experiences across CVS Health and 3 other companies",
        "4 educational experiences at Western University of Health Sciences and 3 other schools"
      ]
    },
    {
      "name": "Clinical Research",
      "positions": ["KTH Royal Institute of Technology"],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Laboratory Skills",
      "positions": [
        "4 educational experiences at Western University of Health Sciences and 3 other schools"
      ],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Data Analysis",
      "positions": [
        "4 educational experiences at Western University of Health Sciences and 3 other schools"
      ],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Clinical Trials",
      "positions": ["Western University of Health Sciences"],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Project Management",
      "positions": [
        "3 experiences across CVS Health and 2 other companies",
        "4 educational experiences at Western University of Health Sciences and 3 other schools"
      ],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Literature Reviews",
      "positions": ["KTH Royal Institute of Technology"],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Research Proposals",
      "endorsements": "1 endorsement"
    },
    {
      "name": "Healthcare Compliance",
      "positions": [
        "Support Pharmacist | Patient Care Management, Medication Optimization, Healthcare Collaboration at CVS Health"
      ],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Expense Reports",
      "positions": ["Western University of Health Sciences"],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Multi-disciplinary Teams",
      "endorsements": "1 endorsement"
    },
    {
      "name": "Research Skills",
      "positions": [
        "2 educational experiences at Western University of Health Sciences and 1 other school"
      ],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Peer Relationships",
      "endorsements": "1 endorsement"
    },
    {
      "name": "Drug Utilization Review",
      "positions": [
        "5 experiences across CVS Health and 3 other companies",
        "Western University of Health Sciences"
      ],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Drug Interactions",
      "positions": [
        "Support Pharmacist | Patient Care Management, Medication Optimization, Healthcare Collaboration at CVS Health"
      ],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Client Relations",
      "endorsements": "1 endorsement"
    },
    {
      "name": "Collaboration in Healthcare",
      "endorsements": "1 endorsement"
    },
    {
      "name": "Presentation Skills",
      "positions": [
        "4 educational experiences at Western University of Health Sciences and 3 other schools"
      ],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Public Speaking",
      "positions": [
        "4 educational experiences at Western University of Health Sciences and 3 other schools"
      ],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Product Marketing",
      "endorsements": "1 endorsement"
    },
    {
      "name": "Time Management",
      "positions": [
        "Certified Pharmacy Technician | Prescription Dispensing, Inventory Management, HIPAA Compliance at CVS Health"
      ],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Teamwork",
      "positions": [
        "Certified Pharmacy Technician | Prescription Dispensing, Inventory Management, HIPAA Compliance at CVS Health"
      ],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Collaborative Problem Solving",
      "positions": [
        "4 experiences across CVS Health and 2 other companies",
        "3 educational experiences at Western University of Health Sciences and 2 other schools"
      ],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Insurance Billing",
      "positions": [
        "Certified Pharmacy Technician | Prescription Dispensing, Inventory Management, HIPAA Compliance at CVS Health"
      ],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Patient Safety",
      "endorsements": "1 endorsement"
    },
    {
      "name": "Customer Service",
      "positions": [
        "Certified Pharmacy Technician | Prescription Dispensing, Inventory Management, HIPAA Compliance at CVS Health"
      ],
      "endorsements": "1 endorsement"
    },
    {
      "name": "U.S. Health Insurance Portability and Accountability Act (HIPAA)",
      "positions": [
        "Certified Pharmacy Technician | Prescription Dispensing, Inventory Management, HIPAA Compliance at CVS Health"
      ],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Pharmacology",
      "positions": ["Western University of Health Sciences"],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Pharmacodynamics",
      "positions": ["Western University of Health Sciences"],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Pharmaceuticals",
      "endorsements": "1 endorsement"
    },
    {
      "name": "Cardiopulmonary Resuscitation (CPR)",
      "positions": [
        "Support Pharmacist | Patient Care Management, Medication Optimization, Healthcare Collaboration at CVS Health"
      ],
      "endorsements": "1 endorsement"
    },
    {
      "name": "OTC",
      "positions": [
        "Intern Pharmacist | Immunization Administration, Patient Counseling, Medication Safety at CVS Health"
      ],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Immunization",
      "positions": [
        "Intern Pharmacist | Immunization Administration, Patient Counseling, Medication Safety at CVS Health"
      ],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Basic Life Support (BLS)",
      "positions": [
        "Support Pharmacist | Patient Care Management, Medication Optimization, Healthcare Collaboration at CVS Health"
      ],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Medicaid",
      "endorsements": "1 endorsement"
    },
    {
      "name": "Medical Devices",
      "endorsements": "1 endorsement"
    },
    {
      "name": "Medical Terminology",
      "positions": [
        "Support Pharmacist | Patient Care Management, Medication Optimization, Healthcare Collaboration at CVS Health",
        "Western University of Health Sciences"
      ],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Retail",
      "positions": ["2 experiences at CVS Health"],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Patient Counseling",
      "positions": [
        "Intern Pharmacist | Immunization Administration, Patient Counseling, Medication Safety at CVS Health"
      ],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Medication Adherence",
      "positions": [
        "Support Pharmacist | Patient Care Management, Medication Optimization, Healthcare Collaboration at CVS Health"
      ],
      "endorsements": "1 endorsement"
    },
    {
      "name": "Microsoft Excel",
      "positions": ["Excel Formulas and Functions Quick Tips"]
    }
  ],
  "courses": [
    {
      "title": "Applied Gene Technology",
      "associatedWith": "Associated with KTH Royal Institute of Technology",
      "associatedWithLink": "https://www.linkedin.com/company/4814/"
    },
    {
      "title": "Bioinformatics",
      "associatedWith": "Associated with KTH Royal Institute of Technology",
      "associatedWithLink": "https://www.linkedin.com/company/4814/"
    }
  ],
  "publications": [
    {
      "title": "Evidence-Based Cardiovascular Disease Medicines' Availability in Low-Cost Generic Drug Programs in the United States: A Cross-Sectional Study",
      "publishedAt": "Annals of Internal Medicine · Sep 5, 2023",
      "link": "https://www.acpjournals.org/doi/10.7326/M23-0287"
    }
  ],
  "patents": [],
  "honorsAndAwards": [
    {
      "title": "Academic Merit Scholarship",
      "issuedBy": "Biotechnology and Genetic Engineering Discipline, Khulna University",
      "issuedAt": "Oct 2004",
      "description": "Scholarship awarded for outstanding academic achievements and leadership.",
      "associatedWith": "Associated with Khulna University",
      "associatedWithLink": "https://www.linkedin.com/company/9537234/"
    },
    {
      "title": "Academic Merit Scholarship",
      "issuedBy": "Biotechnology and Genetic Engineering Discipline, Khulna University",
      "issuedAt": "Oct 2003",
      "description": "Scholarship awarded for outstanding academic achievements and leadership.",
      "associatedWith": "Associated with Khulna University",
      "associatedWithLink": "https://www.linkedin.com/company/9537234/"
    }
  ],
  "languages": [
    {
      "name": "Bengali",
      "proficiency": "Native or bilingual proficiency"
    },
    {
      "name": "English",
      "proficiency": "Full professional proficiency"
    },
    {
      "name": "Hindi",
      "proficiency": "Limited working proficiency"
    }
  ],
  "featured": null,
  "moreProfiles": [
    {
      "id": "ACoAADLPJPwBkCGTsuAt6NQXwPJ6JJfpzm57ngg",
      "firstName": "Meliton Nathaniel",
      "lastName": "Santos",
      "position": "PharmD Candidate 2026A at Western University of Health Sciences (Pomona, CA)",
      "publicIdentifier": "meliton-nathaniel-santos-bb858b1b9",
      "linkedinUrl": "https://www.linkedin.com/in/meliton-nathaniel-santos-bb858b1b9"
    },
    {
      "id": "ACoAAC2r33QBz4r6f1fJVsFMMmNxC5OvzyfSMQk",
      "firstName": "Parastou",
      "lastName": "Divdad",
      "publicIdentifier": "parastou-divdad-130741194",
      "linkedinUrl": "https://www.linkedin.com/in/parastou-divdad-130741194"
    },
    {
      "id": "ACoAAEMCk1IBD77_jtz_15tL6DytjZYk6npFyJk",
      "firstName": "Danica",
      "lastName": "Cabrera",
      "publicIdentifier": "danica-cabrera07",
      "linkedinUrl": "https://www.linkedin.com/in/danica-cabrera07"
    },
    {
      "id": "ACoAAAQPJU8BLpBimqo7xv1VXFyF8lc6rIEfQP4",
      "firstName": "Jessica",
      "lastName": "Beck",
      "publicIdentifier": "jessica-beck-6939821a",
      "linkedinUrl": "https://www.linkedin.com/in/jessica-beck-6939821a"
    },
    {
      "id": "ACoAABXvxpQBxlwYItRelu-xBFwJ9dRacFbxgyA",
      "firstName": "Akhtar",
      "lastName": "Ss",
      "publicIdentifier": "akhtar-ss-5b0307a3",
      "linkedinUrl": "https://www.linkedin.com/in/akhtar-ss-5b0307a3"
    },
    {
      "id": "ACoAAFvBUeIBdNs41-pDunpU0osyJY7pxzNSjUo",
      "firstName": "Joseph",
      "lastName": "Rios",
      "position": "--",
      "publicIdentifier": "joseph-rios-25665a36b",
      "linkedinUrl": "https://www.linkedin.com/in/joseph-rios-25665a36b"
    },
    {
      "id": "ACoAACh1SjMB0xoAZI1qp9L5RLTl1Cwvu-EufYU",
      "firstName": "Nancy",
      "lastName": "Huynh, PharmD",
      "position": "Medical Information/Medical Affairs Fellow at BridgeBio",
      "publicIdentifier": "nhuynhh",
      "linkedinUrl": "https://www.linkedin.com/in/nhuynhh"
    },
    {
      "id": "ACoAAC7OFXIBzudKTqDYxiiX5CeaFclgy0k47eA",
      "firstName": "Nicolet",
      "lastName": "Deeb, PharmD, RPh",
      "publicIdentifier": "nicolet-deeb-pharmd-rph-756b9319a",
      "linkedinUrl": "https://www.linkedin.com/in/nicolet-deeb-pharmd-rph-756b9319a"
    },
    {
      "id": "ACoAAE_6LyUBVb29GH3VJGcuCkfsGOBKoHZhB8E",
      "firstName": "Kimberly",
      "lastName": "Castillo",
      "position": "Optometrist at Silver Strand Optometry",
      "publicIdentifier": "kimberly-castillo-485446315",
      "linkedinUrl": "https://www.linkedin.com/in/kimberly-castillo-485446315"
    },
    {
      "id": "ACoAACwhQKcBI10ya5Rb4Mx53Ik1M2cHNnbHCB0",
      "firstName": "Tram",
      "lastName": "Do, DVM",
      "position": "Veterinarian",
      "publicIdentifier": "tramdo95",
      "linkedinUrl": "https://www.linkedin.com/in/tramdo95"
    },
    {
      "id": "ACoAAC4Fhe0BDF09C6EjIC47ILVuLMlHOJjJV0Q",
      "firstName": "Kimberly",
      "lastName": "G.",
      "position": "Pharmacy Manager",
      "publicIdentifier": "kimberlyisabel",
      "linkedinUrl": "https://www.linkedin.com/in/kimberlyisabel"
    }
  ]
}
```

## Linkedin Profile Search API

The actor stores results in a dataset. You can export data in various formats such as CSV, JSON, XLS, etc. You can scrape and access data on demand using API.

## Deduplication

This Actor support Deduplication feature that allows you to avoid collecting duplicate LinkedIn profiles across multiple runs. This feature works via connecting to your MongoDB database where the Actor will store profile IDs of already scraped profiles and check against them in subsequent runs to skip duplicates. The Actor is not able to save profiles on its own, so your MongoDB database is required (feel free to create a new one with free-tier MongoDB Atlas, don't forget to allow all IPs to connect to it).

After creating, copy your `connection string` that looks like this: `mongodb+srv://<username>:<password>@cluster0.mongodb.net`. Paste it in the Actor input page -> `Deduplication` -> `MongoDB Connection String` input field.  
Your connection string is encrypted and accessible by the Actor only in your run. [Read more](https://docs.apify.com/platform/actors/development/actor-definition/input-schema/secret-input#encryption-mechanism)

## Large scale scraping and Rate Limits

If you need to scrape large volumes (50,000+ profiles), the actor might possibly hit rate LinkedIn's rate limits.
We recommend to have an automation to distribute your workload evenly, so that each hour in a day has nearly the same number of requests (avoiding bursts).  
We count and reset rate limits hourly, so when it hits rate limits, you can continue scraping at the beginning of the next hour. If it still doesn't fit your volumes, please create an issue and let us know how many search pages you need to scrape per hour, and we will scale it for you.

Example of working around rate limits:

```js
const client = new ApifyClient({ token: process.env.APIFY_API_KEY });
const result1 = await client.actor('harvestapi/linkedin-profile-search').call({
  currentJobTitles: ['CEO'],
  startPage: 1,
  takePages: 10, // for example, you want to scrape 10 pages
});

const { items } = await client.dataset(result1.defaultDatasetId).listItems();

if (result1.statusMessage === 'rate limited') {
  // we've hit the rate limit.

  // await until the next hour
  await new Promise((resolve) =>
    setTimeout(
      resolve,
      3600000 -
        (new Date().getMinutes() * 60000 +
          new Date().getSeconds() * 1000 +
          new Date().getMilliseconds()),
    ),
  );

  // continue scraping the next page after the last successfully scraped page
  const lastScrapedPageNumber = items[items.length - 1]?._meta?.pagination?.pageNumber || 0;

  const result2 = await client.actor('harvestapi/linkedin-profile-search').call({
    currentJobTitles: ['CEO'],
    startPage: lastScrapedPageNumber + 1,
    takePages: 10 - lastScrapedPageNumber,
  });
}
```

### Support and Feedback

We continuously enhance our tools based on user feedback. If you encounter technical issues or have suggestions for improvement:

- Create an issue on the actor’s Issues tab in Apify Console
- Chat with us on our [Discord server](https://discord.gg/TGA9k9u2gE)
- Or contact us at contact@harvest-api.com
