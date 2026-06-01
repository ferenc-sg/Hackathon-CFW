import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function bullets(arr: string[]): string {
  return JSON.stringify(arr);
}

async function main() {
  console.log("Seeding database...");

  // Tracks
  const icTrack = await prisma.track.upsert({
    where: { name: "IC" },
    update: {},
    create: { name: "IC" },
  });
  const mTrack = await prisma.track.upsert({
    where: { name: "M" },
    update: {},
    create: { name: "M" },
  });

  // Levels
  const levelData = [
    { trackId: icTrack.id, code: "IC2", label: "Beginner", order: 1 },
    { trackId: icTrack.id, code: "IC3", label: "Proficient", order: 2 },
    { trackId: icTrack.id, code: "IC4", label: "Fully proficient", order: 3 },
    { trackId: icTrack.id, code: "IC5", label: "Domain expert", order: 4 },
    { trackId: mTrack.id, code: "M4", label: "Team Lead", order: 1 },
    { trackId: mTrack.id, code: "M5", label: "Senior Manager", order: 2 },
    { trackId: mTrack.id, code: "M6", label: "Strategic Leader", order: 3 },
  ];

  const levels: Record<string, string> = {};
  for (const l of levelData) {
    const level = await prisma.level.upsert({
      where: { code: l.code },
      update: {},
      create: l,
    });
    levels[l.code] = level.id;
  }

  // Brands
  await prisma.brand.upsert({
    where: { name: "Central saas.group" },
    update: {},
    create: { name: "Central saas.group" },
  });

  // --- GENERAL COMPETENCIES ---

  const generalCompetencies = [
    {
      name: "Influence",
      description:
        "The ability to shape decisions, build alignment, and earn trust — without relying solely on positional authority.",
      icExpectations: {
        IC2: [
          "Communicates clearly within their immediate team; work requires minimal rework.",
          "Builds credibility through reliable delivery on defined tasks.",
          "Shares opinions and concerns constructively in team discussions.",
          "Listens actively and incorporates feedback from peers and managers.",
        ],
        IC3: [
          "Influences peers and cross-functional partners through well-structured arguments and evidence.",
          "Builds credibility through consistent, high-quality delivery.",
          "Identifies when to escalate vs. resolve independently, and acts accordingly.",
          "Navigates differing opinions and reaches workable agreements.",
        ],
        IC4: [
          "Shapes direction at the team or product level; influences how the broader group approaches problems.",
          "Earns trust with senior stakeholders through expertise and judgment.",
          "Drives alignment on ambiguous or contested decisions.",
          "Recognized as a go-to voice in their domain by peers and leadership.",
        ],
        IC5: [
          "Shapes organizational-level decisions; credibility spans teams and senior leadership.",
          "Advocates effectively for strategic priorities in leadership forums.",
          "Builds lasting influence by investing in relationships across the organization.",
          "Sets norms and standards that others naturally follow.",
        ],
      },
      mExpectations: {
        M4: [
          "Sets clear direction for their team; translates strategy into actionable priorities.",
          "Builds alignment within the team on goals and ways of working.",
          "Influences peers in adjacent teams through credibility and collaboration.",
          "Represents the team's interests effectively to senior stakeholders.",
        ],
        M5: [
          "Influences across departments; builds alignment on ambiguous or contested decisions.",
          "Shapes strategy discussions at the leadership level.",
          "Navigates complex organizational dynamics to move initiatives forward.",
          "Mentors managers on how to influence effectively without positional power.",
        ],
        M6: [
          "Shapes organizational strategy; influences executives and external stakeholders.",
          "Establishes the frameworks and narratives that define how the organization makes decisions.",
          "Builds coalitions across the business to drive large-scale change.",
          "Is a trusted voice to the board, exec team, and external partners.",
        ],
      },
    },
    {
      name: "Autonomy",
      description:
        "The degree to which someone defines their own work, resolves blockers independently, and operates without close supervision.",
      icExpectations: {
        IC2: [
          "Works on clearly defined tasks with regular guidance from more senior team members.",
          "Escalates blockers promptly and clearly rather than waiting for them to resolve.",
          "Follows established processes and asks questions when unsure.",
          "Completes assigned work reliably within expected timeframes.",
        ],
        IC3: [
          "Independently owns small-to-medium scope work; identifies and resolves blockers without waiting to be asked.",
          "Scopes and plans their own tasks with minimal oversight.",
          "Proactively identifies risks and communicates them before they become problems.",
          "Comfortable operating in moderately ambiguous situations.",
        ],
        IC4: [
          "Drives ambiguous problems to resolution without supervision; defines their own scope and methods.",
          "Sets their own priorities in alignment with team and organizational goals.",
          "Creates clarity in uncertain or fast-moving situations.",
          "Others rely on their judgment when direction is unclear.",
        ],
        IC5: [
          "Sets direction for entire product areas or technical domains; others rely on their judgment.",
          "Operates effectively with minimal structural guidance from above.",
          "Proactively identifies and addresses strategic gaps before they are visible to others.",
          "Self-manages at the highest level of ambiguity and complexity.",
        ],
      },
      mExpectations: {
        M4: [
          "Independently manages day-to-day team operations with minimal oversight.",
          "Makes team-level decisions confidently within their scope.",
          "Escalates strategically — only when senior input is genuinely needed.",
          "Handles routine and moderately complex people situations without escalation.",
        ],
        M5: [
          "Operates with significant autonomy across departmental decisions.",
          "Defines and drives their own roadmap within organizational constraints.",
          "Comfortable making high-stakes decisions under uncertainty.",
          "Proactively fills leadership gaps across teams when needed.",
        ],
        M6: [
          "Self-directed at the organizational level; proactively identifies and addresses strategic gaps.",
          "Operates effectively in highly ambiguous, fast-changing environments.",
          "Shapes the conditions for others to operate autonomously.",
          "Trusted to represent the organization in high-stakes external contexts.",
        ],
      },
    },
    {
      name: "Proficiency",
      description:
        "Depth of knowledge, skill, and craft in the core discipline of the role.",
      icExpectations: {
        IC2: [
          "Developing core skills in their discipline; applies established approaches with guidance.",
          "Completes well-defined work reliably using existing tools and methods.",
          "Actively learns from code reviews, design critiques, and peer feedback.",
          "Asks good questions that accelerate their own growth.",
        ],
        IC3: [
          "Solid practitioner; applies best practices reliably and is growing their toolkit.",
          "Handles moderately complex work independently.",
          "Identifies areas where existing approaches are insufficient and proposes improvements.",
          "Shares knowledge effectively with peers.",
        ],
        IC4: [
          "Expert in their discipline; regularly advances or improves practice within their area.",
          "Handles highly complex work with confidence and sound judgment.",
          "Recognized as a technical or domain authority by peers.",
          "Raises the bar on quality standards for the team.",
        ],
        IC5: [
          "Recognized authority in their field; their work sets the standard others follow.",
          "Contributes meaningfully to the state of the art in their discipline.",
          "Solves problems that no one else in the organization can.",
          "Defines the craft standards and practices that others are trained on.",
        ],
      },
      mExpectations: {
        M4: [
          "Maintains strong functional depth alongside management responsibilities.",
          "Can credibly review and guide the work of their team members.",
          "Applies domain expertise to unblock and accelerate team delivery.",
          "Knows when to leverage their own skills vs. develop the team's.",
        ],
        M5: [
          "Deep domain expertise combined with cross-functional breadth.",
          "Provides authoritative guidance on complex domain questions across multiple teams.",
          "Bridges functional depth and organizational context in strategic decisions.",
          "Develops proficiency in their team leaders through coaching and mentorship.",
        ],
        M6: [
          "Strategic-level mastery; defines how the discipline operates at the organization.",
          "Recognized externally as well as internally for domain expertise.",
          "Shapes hiring, learning, and quality standards for the entire function.",
          "Translates deep domain knowledge into organizational competitive advantage.",
        ],
      },
    },
    {
      name: "Collaboration",
      description:
        "The ability to work effectively with others — across team boundaries, disciplines, and levels — to achieve shared goals.",
      icExpectations: {
        IC2: [
          "Works effectively within their immediate team; participates in cross-functional activities when asked.",
          "Gives and receives feedback constructively.",
          "Contributes to a positive team environment through reliability and respect.",
          "Flags conflicts or misalignments early rather than letting them fester.",
        ],
        IC3: [
          "Actively collaborates across functions; builds productive working relationships.",
          "Gives honest, kind feedback that helps others improve.",
          "Resolves minor interpersonal friction directly and professionally.",
          "Contributes meaningfully to team rituals, retrospectives, and knowledge-sharing.",
        ],
        IC4: [
          "Drives cross-functional collaboration; resolves interpersonal friction constructively.",
          "Elevates the people around them by sharing knowledge, mentoring, and creating space for others.",
          "Creates structures and habits that make the team more effective.",
          "Bridges communication across disciplines in ways that reduce misunderstanding.",
        ],
        IC5: [
          "Cultivates collaboration at scale; creates norms and structures that improve how large groups work together.",
          "Models collaborative behavior that others naturally emulate.",
          "Identifies and removes systemic barriers to effective cross-team work.",
          "Invests in the success of peers and adjacent teams as much as their own.",
        ],
      },
      mExpectations: {
        M4: [
          "Builds cohesion within their team; surfaces and removes collaboration blockers.",
          "Partners effectively with peer managers across teams.",
          "Models psychological safety — makes it easy for the team to raise concerns.",
          "Maintains trust with their team through transparency and consistency.",
        ],
        M5: [
          "Drives effective collaboration across multiple teams and senior stakeholders.",
          "Manages organizational tension and competing priorities constructively.",
          "Creates forums and structures that improve how teams work together.",
          "Coaches their managers on collaborative leadership practices.",
        ],
        M6: [
          "Shapes organizational culture of collaboration; models and mandates collaborative practice at scale.",
          "Bridges divisions across the company to enable coordinated execution.",
          "Creates conditions where cross-functional collaboration is the default, not the exception.",
          "Holds leadership accountable for collaborative behaviors.",
        ],
      },
    },
    {
      name: "AI Application & Enablement",
      description:
        "The ability to use AI tools effectively to improve personal and team productivity, and to advocate for and enable AI adoption across the organization.",
      icExpectations: {
        IC2: [
          "Aware of AI tools available in their work context; experimenting with basic AI-assisted workflows.",
          "Uses AI to reduce repetitive work in their immediate scope.",
          "Asks questions and seeks guidance on effective AI tool usage.",
          "Open to trying new AI-powered approaches suggested by the team.",
        ],
        IC3: [
          "Regularly uses AI tools to meaningfully improve personal productivity.",
          "Shares AI tool discoveries and effective prompting approaches with immediate team members.",
          "Identifies where AI can reduce friction or improve quality in their workflow.",
          "Evaluates AI-generated outputs critically before using them.",
        ],
        IC4: [
          "Integrates AI meaningfully into their own workflows and their team's practices.",
          "Identifies and champions high-value AI use cases for the team or product.",
          "Trains and guides peers on effective AI usage in their domain.",
          "Stays current on AI tool developments relevant to their discipline.",
        ],
        IC5: [
          "Defines AI strategy for their domain; drives adoption and elevates AI literacy across the broader organization.",
          "Identifies transformative AI opportunities that others haven't recognized.",
          "Influences how the organization thinks about and invests in AI enablement.",
          "Builds sustainable AI-enabled practices that outlast individual tool changes.",
        ],
      },
      mExpectations: {
        M4: [
          "Encourages and models AI tool adoption within their team; creates space for experimentation.",
          "Removes blockers that prevent the team from using AI tools effectively.",
          "Sets expectations that AI usage is part of how the team operates.",
          "Recognizes and celebrates effective AI usage in the team.",
        ],
        M5: [
          "Drives AI adoption across their department; identifies strategic AI opportunities.",
          "Builds a culture of AI experimentation and continuous learning in their area.",
          "Advocates for AI enablement investment at the leadership level.",
          "Coordinates AI adoption across multiple teams to avoid duplication and gaps.",
        ],
        M6: [
          "Shapes the organization's AI strategy; ensures AI enablement is embedded in culture and processes.",
          "Defines the AI capability roadmap for the organization.",
          "Ensures AI ethics and responsible usage are embedded in how the org operates.",
          "Represents the organization externally on AI adoption and enablement topics.",
        ],
      },
    },
  ];

  const generalCompIds: string[] = [];

  for (let i = 0; i < generalCompetencies.length; i++) {
    const gc = generalCompetencies[i];
    const comp = await prisma.competency.upsert({
      where: {
        // SQLite doesn't support compound unique on nullable fields easily,
        // so we use a workaround: find by name + scope
        id:
          (
            await prisma.competency.findFirst({
              where: { name: gc.name, scope: "GLOBAL" },
            })
          )?.id ?? "nonexistent",
      },
      update: { description: gc.description },
      create: {
        name: gc.name,
        description: gc.description,
        type: "GENERAL",
        scope: "GLOBAL",
        provenance: "SHARED_BASELINE",
      },
    });
    generalCompIds.push(comp.id);

    // IC expectations
    for (const [code, bArr] of Object.entries(gc.icExpectations)) {
      await prisma.competencyLevelExpectation.upsert({
        where: {
          competencyId_levelId: {
            competencyId: comp.id,
            levelId: levels[code],
          },
        },
        update: { bullets: bullets(bArr) },
        create: {
          competencyId: comp.id,
          levelId: levels[code],
          bullets: bullets(bArr),
          status: "PUBLISHED",
        },
      });
    }

    // M expectations
    for (const [code, bArr] of Object.entries(gc.mExpectations)) {
      await prisma.competencyLevelExpectation.upsert({
        where: {
          competencyId_levelId: {
            competencyId: comp.id,
            levelId: levels[code],
          },
        },
        update: { bullets: bullets(bArr) },
        create: {
          competencyId: comp.id,
          levelId: levels[code],
          bullets: bullets(bArr),
          status: "PUBLISHED",
        },
      });
    }
  }

  console.log(`Seeded ${generalCompetencies.length} general competencies.`);

  // --- PRODUCT MANAGEMENT JOB FAMILY ---

  const pmFamily = await prisma.jobFamily.upsert({
    where: { name: "Product Management" },
    update: {},
    create: {
      name: "Product Management",
      description:
        "Product managers who define, build, and ship product functionality across the portfolio.",
      displayOrder: 1,
    },
  });

  // PM functional competencies — sourced from spreadsheet
  const pmCompetencies = [
    {
      name: "Product Execution: Feature Specification",
      description:
        "The ability for a PM to gather requirements, define functionality, and set goals in a clear, actionable format that can be used to communicate with the team and drive product delivery.",
      displayOrder: 1,
      expectations: {
        IC2: [
          "Gathers requirements with basic to medium complexity with guidance from more senior PMs.",
          "Defines simple functionality based on clear instructions.",
          "Communicates requirements clearly to the team for straightforward tasks, writes understandable and detailed documentation.",
          "Relies on templates and predefined formats for specification documents.",
        ],
        IC3: [
          "Independently gathers and refines requirements for moderately complex features, only requires occasional guidance.",
          "Defines functionality with an understanding of broader product goals.",
          "Communicates requirements effectively to cross-functional teams.",
          "Creates specification documents that are clear and actionable with minimal oversight.",
        ],
        IC4: [
          "Leads the gathering of requirements for complex features involving multiple stakeholders.",
          "Defines functionality that aligns with strategic objectives and user needs.",
          "Anticipates potential challenges in functionality and sets clear goals to address them.",
          "Reviews and refines specification documents to ensure they are comprehensive and aligned with product strategy.",
        ],
        IC5: [
          "Oversees the feature specification process for entire product areas or major initiatives.",
          "Ensures that all requirements and functionalities align with the overall product vision.",
          "Mentors other PMs in the best practices of feature specification and goal setting.",
          "Develops and maintains templates and guidelines for feature specifications across the organization.",
        ],
      },
    },
    {
      name: "Product Execution: Product Delivery",
      description:
        "The ability to work closely with one's immediate team (engineering, design, etc.) to iteratively and quickly deliver product functionality that accomplishes pre-defined goals.",
      displayOrder: 2,
      expectations: {
        IC2: [
          "Works closely with immediate team members to deliver small, well-defined product features.",
          "Follows established processes to ensure timely delivery of tasks.",
          "Seeks feedback regularly from team members to ensure alignment.",
          "Contributes to team meetings by providing status updates and addressing blockers.",
        ],
        IC3: [
          "Manages the delivery of more complex product features, coordinating with design, engineering and relevant business functions.",
          "Identifies and addresses potential delivery risks in advance.",
          "Uses iterative processes to refine and improve product functionality before launch.",
          "Provides clear, consistent communication on delivery timelines and progress.",
        ],
        IC4: [
          "Oversees the delivery of major features or initiatives, ensuring alignment with business goals and strategy.",
          "Balances speed of delivery with quality, making trade-offs when necessary.",
          "Coordinates across multiple teams and manages dependencies to ensure smooth delivery.",
          "Continuously optimizes delivery processes to increase efficiency and reduce bottlenecks.",
        ],
        IC5: [
          "Able to completely own a product and leads the delivery strategy for large-scale projects or entire product lines.",
          "Ensures that all teams are aligned and working towards the same delivery goals.",
          "Develops frameworks for rapid and effective product delivery across teams.",
          "Acts as the final point of escalation for delivery challenges and removes obstacles.",
        ],
      },
    },
    {
      name: "Product Execution: Quality Assurance",
      description:
        "The ability to identify, prioritize, and resolve technical, functional, and business quality issues across all devices, countries, and use cases that are applicable to the product.",
      displayOrder: 3,
      expectations: {
        IC2: [
          "Participates in Product QA processes by helping to identify basic quality issues.",
          "Works with Engineering to understand the impact of defects and bugs.",
          "Follows up on quality issues under the guidance of more experienced PMs.",
          "Ensures that simple features meet basic quality standards before release.",
        ],
        IC3: [
          "Prioritizes and resolves quality issues that impact user experience or product functionality.",
          "Works closely with Engineering teams to define acceptance criteria and test plans.",
          "Monitors and addresses quality issues across multiple devices and platforms.",
          "Ensures that the delivered product meets functional, technical, and business quality standards.",
        ],
        IC4: [
          "Leads efforts to maintain high quality across complex product features.",
          "Anticipates potential quality risks and implements strategies to mitigate them.",
          "Ensures comprehensive testing across all relevant use cases, devices, and regions.",
          "Drives continuous improvement in QA processes together with Engineering, incorporating feedback from previous releases.",
        ],
        IC5: [
          "Defines the quality assurance strategy for entire product areas or major initiatives.",
          "Ensures that quality is a core focus across the product lifecycle.",
          "Mentors other PMs in understanding and enforcing quality standards.",
          "Oversees the implementation of advanced QA techniques and tools to enhance product quality.",
        ],
      },
    },
    {
      name: "Customer Insight: Fluency with Data",
      description:
        "The ability to use data to generate actionable insights, to leverage those insights to achieve goals set for the product, and to connect those quantified goals to meaningful outcomes for the business.",
      displayOrder: 4,
      expectations: {
        IC2: [
          "Learns to analyze basic data sets with guidance from senior team members.",
          "Applies data insights to make suggestions or simple product decisions.",
          "Tracks and reports on key metrics relevant to their area of responsibility.",
          "Uses data to identify trends and provide input on small feature adjustments.",
        ],
        IC3: [
          "Independently analyzes data to generate insights that guide product decisions.",
          "Uses data to validate assumptions and inform feature prioritization.",
          "Collaborates with data analysts to refine metrics and reporting methods.",
          "Makes data-driven recommendations that align with broader product goals.",
        ],
        IC4: [
          "Leads the analysis of complex data sets to inform strategic product decisions.",
          "Identifies and tracks key metrics that impact product success and business outcomes.",
          "Uses advanced data techniques to uncover deeper insights and opportunities.",
          "Mentors less senior PMs in using data effectively to drive product decisions. Educates cross-functional teams about key metrics usage.",
        ],
        IC5: [
          "Defines the data strategy for the product area, ensuring alignment with business objectives.",
          "Oversees the integration of data insights into the product development process.",
          "Drives the use of advanced analytics and data science as much as possible within the business context to enhance product performance.",
          "Leads initiatives to improve data fluency across the product team.",
        ],
      },
    },
    {
      name: "Customer Insight: Voice of the Customer",
      description:
        "The ability to leverage user feedback in all its forms (from casual conversations to formal studies) to understand how users engage with the product, make better decisions, and drive meaningful outcomes for the business.",
      displayOrder: 5,
      expectations: {
        IC2: [
          "Collects user feedback through basic methods, such as surveys and interviews, in collaboration with more senior members.",
          "Uses feedback to make small adjustments to product features.",
          "Participates in user testing sessions and reports findings to the team.",
          "Learns to understand and empathize with user needs and challenges.",
        ],
        IC3: [
          "Regularly gathers and synthesizes user feedback from multiple sources.",
          "Translates user insights into actionable product improvements.",
          "Works with the design and engineering teams to ensure user needs are met.",
          "Advocates for the customer in product discussions and prioritization.",
        ],
        IC4: [
          "Leads efforts to deeply understand customer needs and pain points.",
          "Uses customer insights to drive significant product changes and innovations.",
          "Develops and maintains strong relationships with key user groups, in regular contact with users.",
          "Mentors other PMs in effectively leveraging the voice of the customer.",
        ],
        IC5: [
          "Defines the strategy for incorporating customer feedback into product development.",
          "Ensures that the voice of the customer is central to the product vision and strategy.",
          "Leads initiatives to gather and analyze customer feedback at scale.",
          "Coaches teams on best practices for understanding and responding to customer needs.",
        ],
      },
    },
    {
      name: "Customer Insight: User Experience Design",
      description:
        "The ability, both as an individual and working with the design team, to define requirements and deliver UX designs that are easy to use, leverage UX best practices, and align with the predominant UX patterns present in the product.",
      displayOrder: 6,
      expectations: {
        IC2: [
          "Works with the design team to understand basic UX principles.",
          "Contributes to the creation of user flows and wireframes for simple features.",
          "Provides input on UX designs from a user perspective.",
          "Follows established UX patterns and best practices in their product area.",
        ],
        IC3: [
          "Collaborates with designers to create user-centric UX designs for more complex features.",
          "Ensures that UX designs align with user needs and business goals.",
          "Participates in user testing to validate and refine UX designs.",
          "Advocates for UX best practices and consistency across the product.",
        ],
        IC4: [
          "Leads the development of UX designs that significantly enhance user satisfaction and engagement.",
          "Works closely with design colleague(s) to ensure the product meets high UX standards.",
          "Drives UX innovation in response to user feedback and market trends.",
          "Mentors less senior PMs and designers in creating intuitive and effective user experiences.",
        ],
        IC5: [
          "Defines the UX strategy for the product area, ensuring it aligns with the overall product vision.",
          "Oversees the development and implementation of UX guidelines and patterns.",
          "Leads initiatives to elevate the overall UX quality across the product portfolio.",
          "Acts as the key advocate for the user experience within the organization.",
        ],
      },
    },
    {
      name: "Product Strategy: Business Outcome Ownership",
      description:
        "The ability to drive meaningful outcomes for the business by connecting product functionality and goals to the strategic objectives of the PM's team and the company overall.",
      displayOrder: 7,
      expectations: {
        IC2: [
          "Understands the basic connection between product features and business outcomes.",
          "Contributes to small projects that drive specific business results.",
          "Tracks progress toward predefined business goals with guidance.",
          "Learns to connect product decisions to broader business objectives.",
        ],
        IC3: [
          "Independently drives product features that contribute to key business outcomes.",
          "Aligns feature prioritization with business goals and user needs.",
          "Monitors and reports on the impact of product changes on business metrics.",
          "Proactively identifies opportunities to improve business results through product enhancements.",
        ],
        IC4: [
          "Owns the responsibility for driving significant business outcomes through product strategy.",
          "Aligns the product roadmap with strategic business objectives and user needs.",
          "Regularly assesses product performance against key business metrics and adjusts strategy as needed.",
          "Mentors other PMs and cross-functional team members in understanding and achieving business outcomes.",
        ],
        IC5: [
          "Owns and defines the business outcome strategy for the product area, ensuring alignment with the brand's goals.",
          "Oversees the integration of business objectives into the product development process.",
          "Leads efforts to measure and optimize the impact of product changes on business results.",
          "Coaches less senior PMs on how to drive meaningful business outcomes through product management.",
        ],
      },
    },
    {
      name: "Product Strategy: Product Vision & Roadmapping",
      description:
        "The ability to define an overall vision for the PM's area of the product that connects to the strategy for the team and the company. The ability to define a clear roadmap of highly prioritized features and initiatives that deliver against that vision.",
      displayOrder: 8,
      expectations: {
        IC2: [
          "Understands the product vision and roadmap.",
          "Understands the basic principles of product vision and roadmapping.",
          "Follows the established roadmap and provides input on future enhancements.",
          "Learns to connect product vision with user needs and business goals.",
        ],
        IC3: [
          "Independently develops and maintains the roadmap for a specific area of the product, aware how it connects to the larger roadmap.",
          "Aligns the roadmap with the overall product vision and strategic goals.",
          "Prioritizes features based on user needs, market trends, and business objectives.",
          "Regularly communicates roadmap updates to cross-functional teams.",
        ],
        IC4: [
          "Owns and leads the development of a compelling product vision that drives long-term success.",
          "Ensures that the roadmap aligns with strategic objectives and market opportunities, in sync with the brand leadership.",
          "Balances short-term needs with long-term goals in the roadmap.",
          "Mentors other PMs in creating and executing effective roadmaps.",
        ],
        IC5: [
          "Defines the overall product vision and roadmap strategy for the product area.",
          "Ensures that the roadmap reflects both strategic priorities and customer needs.",
          "Leads efforts to communicate and align the product vision across the organization.",
          "Guides less senior PMs in maintaining a flexible and responsive roadmap that adapts to changes.",
        ],
      },
    },
    {
      name: "Product Strategy: Market Sensitivity",
      description:
        "Being attuned to market trends and competitive dynamics. Market sensitivity allows product managers to grasp the subtle shifts in consumer behavior, emerging industry trends, and the movements of competitors — enabling proactive steering of the product to capitalize on opportunities and sidestep potential pitfalls.",
      displayOrder: 9,
      expectations: {
        IC2: [
          "Learns to track basic market trends and competitor activities under guidance.",
          "Understands the impact of market dynamics on the product's success.",
          "Participates in market research activities to gather data on industry trends.",
          "Provides input on small adjustments to the product based on market feedback.",
        ],
        IC3: [
          "Independently monitors and analyzes market trends and competitor movements.",
          "Uses market insights to influence feature prioritization and product strategy.",
          "Identifies emerging opportunities and potential risks in the market.",
          "Collaborates with marketing and sales teams to align product development with market demands.",
        ],
        IC4: [
          "Leads efforts to stay ahead of market trends and anticipate industry shifts.",
          "Obtains and uses deep market/domain knowledge to drive product innovation and differentiation.",
          "Advises the team on strategic adjustments to the product based on market changes.",
          "Mentors other PMs on how to effectively incorporate market sensitivity into their product strategy.",
        ],
        IC5: [
          "Defines the market sensitivity strategy for the product area, ensuring alignment with long-term business goals.",
          "Oversees competitive analysis and market research initiatives that inform the product roadmap.",
          "Ensures that the product portfolio adapts proactively to shifts in the market landscape.",
          "Guides the organization in leveraging market insights to maintain a competitive edge.",
        ],
      },
    },
    {
      name: "People: Stakeholder Management & Managing Up",
      description:
        "The ability to proactively identify stakeholders impacted by the PM's area of ownership and to work with those stakeholders to factor their requirements into product decisions.",
      displayOrder: 10,
      expectations: {
        IC2: [
          "Identifies and engages with key stakeholders relevant to their immediate work.",
          "Communicates updates and gathers feedback from team members and direct supervisors.",
          "Seeks guidance from senior PMs when managing relationships with higher-level stakeholders.",
          "Follows established processes for stakeholder communication and reporting.",
          "Understands the basic dynamics of stakeholder influence and interests.",
        ],
        IC3: [
          "Independently manages relationships with multiple stakeholders across different teams.",
          "Proactively engages with stakeholders to align on goals, expectations, and timelines.",
          "Effectively communicates project status, risks, and needs to senior leadership.",
          "Balances the interests of different stakeholders while making decisions.",
          "Ensures that stakeholder feedback is incorporated into product planning and execution.",
        ],
        IC4: [
          "Leads stakeholder management for complex projects involving multiple high-level stakeholders.",
          "Anticipates stakeholder concerns and proactively addresses them before they escalate.",
          "Influences senior leadership and decision-makers to gain support for product initiatives.",
          "Manages cross-functional alignment, ensuring all stakeholders are informed and aligned on project goals.",
          "Mentors junior and mid-level PMs on best practices for stakeholder and leadership engagement.",
        ],
        IC5: [
          "Defines the stakeholder management strategy for large-scale initiatives or entire product areas.",
          "Builds and maintains strong relationships with key executives and external stakeholders.",
          "Acts as a trusted advisor to senior leadership, shaping strategic decisions and priorities.",
          "Navigates complex organizational dynamics to secure resources and support for the product.",
          "Coaches other PMs on advanced stakeholder and leadership management techniques.",
        ],
      },
    },
  ];

  for (const pc of pmCompetencies) {
    const comp = await prisma.competency.upsert({
      where: {
        id:
          (
            await prisma.competency.findFirst({
              where: {
                name: pc.name,
                scope: "FAMILY",
                jobFamilyId: pmFamily.id,
              },
            })
          )?.id ?? "nonexistent",
      },
      update: { description: pc.description },
      create: {
        name: pc.name,
        description: pc.description,
        type: "FUNCTIONAL",
        scope: "FAMILY",
        provenance: "SHARED_BASELINE",
        jobFamilyId: pmFamily.id,
      },
    });

    // Join table
    await prisma.jobFamilyCompetency.upsert({
      where: {
        jobFamilyId_competencyId: {
          jobFamilyId: pmFamily.id,
          competencyId: comp.id,
        },
      },
      update: { displayOrder: pc.displayOrder },
      create: {
        jobFamilyId: pmFamily.id,
        competencyId: comp.id,
        displayOrder: pc.displayOrder,
      },
    });

    // Expectations
    for (const [code, bArr] of Object.entries(pc.expectations)) {
      await prisma.competencyLevelExpectation.upsert({
        where: {
          competencyId_levelId: {
            competencyId: comp.id,
            levelId: levels[code],
          },
        },
        update: { bullets: bullets(bArr) },
        create: {
          competencyId: comp.id,
          levelId: levels[code],
          bullets: bullets(bArr),
          status: "PUBLISHED",
        },
      });
    }
  }

  console.log(`Seeded ${pmCompetencies.length} Product Management competencies.`);
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
