export interface Teacher {
  name: string;
  designation: string;
  qualification?: string;
}

export interface DownloadableItem {
  title: string;
  url: string;
  type: 'pdf' | 'doc' | 'link';
}

export interface DepartmentData {
  name: string;
  href: string;
  color: string;
  about: string;
  teachers: Teacher[];
  syllabus: DownloadableItem[];
  routine: DownloadableItem[];
  results: DownloadableItem[];
  notices: DownloadableItem[];
}

export const departmentsData: DepartmentData[] = [
  {
    name: 'Bengali',
    href: 'https://galsimahavidyalaya.ac.in/department/bengali/',
    color: 'from-orange-500/20 to-amber-500/20',
    about: 'The Department of Bengali at Galsi Mahavidyalaya is one of the oldest and most prestigious departments. It offers comprehensive courses in Bengali literature, language, and culture under the NEP 2020 curriculum. The department focuses on developing linguistic proficiency and literary appreciation among students.',
    teachers: [
      { name: 'Dr Pinaki Biswas', designation: 'Assistant Professor (Stage-II)', qualification: 'M.A., Ph.D. (Bengali)' },
      { name: 'Dr. Sampriya Chatterjee', designation: 'Assistant Professor (Stage-II)', qualification: 'M.A., Ph.D. (Bengali)' },
      { name: 'Arpita Dutta (Koner)', designation: 'SACT-II', qualification: 'M.A. (Bengali)' },
      { name: 'Dr. Shyamal Kumar Mondal', designation: 'SACT-I', qualification: 'M.A., Ph.D. (Bengali)' },
      { name: 'Sk. Sofiuddin', designation: 'SACT-II', qualification: 'M.A. (Bengali)' },
      { name: 'Dr. Biswajit Mukherjee', designation: 'SACT-I', qualification: 'M.A., Ph.D. (Bengali)' },
      { name: 'Hriday Pal', designation: 'SACT-II', qualification: 'M.A. (Bengali)' },
    ],
    syllabus: [
      { title: 'B.A 3Yr./4Yr. in Bengali (NEP-2020)', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/10/Syllabus_BABENG_NEP2023-2024.pdf', type: 'pdf' },
      { title: 'Bengali Gen Syllabus (CBCS)', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/Bengali-Gen-syllabus-CBCS.pdf', type: 'pdf' },
      { title: 'Bengali Hons Syllabus (CBCS)', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/Bengali-Hons-Syllabus-CBCS.pdf', type: 'pdf' },
    ],
    routine: [
      { title: 'Lesson Plan 2023-2024 (NEP)', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/BENGALI-LESSION-PLAN-2023-24-NEP.pdf', type: 'pdf' },
      { title: 'Lesson Plan 2022-2023', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/BENGALI-LESSION-PLAN-2022-23-FINAL-CORRECTION.pdf', type: 'pdf' },
      { title: 'Lesson Plan 2021-2022', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/GM-Bengali-lesson-plan-21-22-pdf-final.pdf', type: 'pdf' },
      { title: 'Lesson Plan 2020-2021', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/BENGALI-LESSON-PLAN-2020-2021.pdf', type: 'pdf' },
      { title: 'Lesson Plan 2019-2020', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/11/BENGALI-LESSON-PLAN-2019-20.pdf', type: 'pdf' },
      { title: 'Lesson Plan 2018-2019', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/BENGALI-LESSION-PLAN-2018-19-FINAL-CORRECTION.pdf', type: 'pdf' },
    ],
    results: [
      { title: 'Question Bank (Previous Years)', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/11/BENGALI-DEPARTMENT-PREVIOUS-YEAR-QUESTIONG.M-FINAL.pdf', type: 'pdf' },
    ],
    notices: [
      { title: 'Program Outcomes (PO, PSO & CO)', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/Bengali-PO-PSC-CO.pdf', type: 'pdf' },
      { title: 'Department Activities & Achievements', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/Bengali-Department-Activities-Achievements.pdf', type: 'pdf' },
      { title: 'Important Links', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/Bengali-Important-Links.pdf', type: 'pdf' },
    ],
  },
  {
    name: 'English',
    href: 'https://galsimahavidyalaya.ac.in/department/english/',
    color: 'from-blue-500/20 to-cyan-500/20',
    about: 'The Department of English offers Honours and General courses focusing on English literature, language skills, and communication. The curriculum covers British, American, and Indian English literature, along with modern literary theories and practical language applications.',
    teachers: [
      { name: 'Dr. Debabrata Ghosh', designation: 'Assistant Professor (Stage-III)', qualification: 'M.A., Ph.D. (English)' },
      { name: 'Aheli Paul', designation: 'SACT-II', qualification: 'M.A. (English)' },
      { name: 'Saifuddin Mallick', designation: 'SACT-II', qualification: 'M.A. (English)' },
    ],
    syllabus: [
      { title: 'Syllabus_BAP_ENG_2017-2018', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/English-Pass-Syllabus_BAP_ENG_2017-2018.pdf', type: 'pdf' },
      { title: 'Syllabus_BAENG_2017-2018', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/English-Syllabus_BAENG_2017-2018.pdf', type: 'pdf' },
      { title: 'Syllabus_BAENG_NEP2023-2024', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/English-Syllabus_BAENG_NEP2023-2024.pdf', type: 'pdf' },
    ],
    routine: [
      { title: 'Lesson Plan 2023-24', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/2023-24-Lesson-Plan-English.pdf', type: 'pdf' },
      { title: 'Lesson Plan 2022-23', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/2022-23-Lesson-Plan-English.pdf', type: 'pdf' },
      { title: 'Lesson Plan 2021-22', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/2021-22-Lesson-Plan-English.pdf', type: 'pdf' },
      { title: 'Lesson Plan 2020-21', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/2020-21-Lesson-Plan-English.pdf', type: 'pdf' },
      { title: 'Lesson Plan 2019-20', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/2019-20-Lesson-Plan-English.pdf', type: 'pdf' },
      { title: 'Lesson Plan 2018-19', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/2018-19-Lesson-Plan-English.pdf', type: 'pdf' },
    ],
    results: [
      { title: 'CO, PO, PSO', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/ENGLISH-CO-PO-PSO.pdf', type: 'pdf' },
    ],
    notices: [
      { title: 'Activities & Achievements', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/English-Dept-Activities-Achievements.pdf', type: 'pdf' },
      { title: 'Important Links', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/English-IMPORTANT-LINKS.pdf', type: 'pdf' },
    ],
  },
  {
    name: 'History',
    href: 'https://galsimahavidyalaya.ac.in/department/history/',
    color: 'from-purple-500/20 to-pink-500/20',
    about: 'The Department of History provides an in-depth study of Indian and World History. Students explore ancient, medieval, and modern periods with emphasis on historical methodology, archaeological evidence, and historiography. The department encourages critical thinking and research.',
    teachers: [
      { name: 'Dr. Prasanta Kumar Ghosh', designation: 'Assistant Professor (Stage-III)', qualification: 'M.A., Ph.D. (History)' },
      { name: 'Sanjib Ghosh', designation: 'SACT-II', qualification: 'M.A. (History)' },
      { name: 'Sabita Dey', designation: 'SACT-II', qualification: 'M.A. (History)' },
    ],
    syllabus: [
      { title: 'Syllabus 2017-2018', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/History-Syllabus_BAHIST_2017-2018-1.pdf', type: 'pdf' },
      { title: 'Syllabus_BAP 2017-2018', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/History-Syllabus_BAP_HIST_2017-2018.pdf', type: 'pdf' },
      { title: 'NEP Syllabus', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/SYLLABUS-NEP-History.pdf', type: 'pdf' },
    ],
    routine: [
      { title: 'Lesson Plan CBCS 2022-23', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/2022-23-Lesson-Plan-CBCS-HG-Final.pdf', type: 'pdf' },
    ],
    results: [
      { title: 'CO, PO, PSO', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/History-CO-PO-PSO.pdf', type: 'pdf' },
      { title: 'CO, PO NEP', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/11/CO-PO-NEP-Dept-of-History-NEP.pdf', type: 'pdf' },
    ],
    notices: [
      { title: 'Activities & Achievements', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/History-dept-Activities-and-Achievements-1.pdf', type: 'pdf' },
      { title: 'Important Links', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/History-IMPORTANT-LINKS.pdf', type: 'pdf' },
    ],
  },
  {
    name: 'Geography',
    href: 'https://galsimahavidyalaya.ac.in/department/geography/',
    color: 'from-green-500/20 to-emerald-500/20',
    about: 'The Department of Geography offers comprehensive courses covering physical geography, human geography, and geospatial technologies. Students learn about climate, landforms, population studies, economic geography, and GIS applications through both theoretical and practical sessions.',
    teachers: [
      { name: 'Puja Choudhury', designation: 'SACT-II', qualification: 'M.A. (Geography)' },
      { name: 'Sumita Das', designation: 'SACT-II', qualification: 'M.A. (Geography)' },
    ],
    syllabus: [
      { title: 'Syllabus BA CBCS 2017-2018', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/Geography-Syllabus_BA-CBCS_2017-2018.pdf', type: 'pdf' },
      { title: 'Syllabus NEP 2023-2024', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/Geography-Syllabus_BABSCGEOGR_NEP2023-2024.pdf', type: 'pdf' },
    ],
    routine: [
      { title: 'Lesson Plan 2023-2024', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/LESSON-PLAN-SESSION-2023-2024GEOGRAPHY-DEPT.nep2020.pdf', type: 'pdf' },
      { title: 'Lesson Plan 2022-2023', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/LESSON-PLAN-SESSION-2022-2023GEOGRAPHY-DEPT.pdf', type: 'pdf' },
      { title: 'Lesson Plan 2021-2022', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/LESSON-PLAN-SESSION-2021-2022GEOGRAPHY-DEPT.pdf', type: 'pdf' },
    ],
    results: [
      { title: 'CO, PO & PSO', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/Geography-CO-PO-PSO.pdf', type: 'pdf' },
    ],
    notices: [
      { title: 'Activities & Achievements', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/Geography-Dept-Activities-and-Achievements.pdf', type: 'pdf' },
      { title: 'Important Links', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/08/Students-Corner.pdf', type: 'pdf' },
    ],
  },
  {
    name: 'Sanskrit',
    href: 'https://galsimahavidyalaya.ac.in/department/sanskrit/',
    color: 'from-yellow-500/20 to-orange-500/20',
    about: 'The Department of Sanskrit preserves and promotes the rich heritage of Sanskrit literature and language. The curriculum includes Vedic literature, classical Sanskrit texts, grammar, and philosophy. Students gain proficiency in reading, writing, and interpreting ancient texts.',
    teachers: [
      { name: 'Dr. Shyamal Kumar Das', designation: 'Assistant Professor (Stage-II)', qualification: 'M.A., Ph.D. (Sanskrit)' },
      { name: 'Sankar Prasad Ghosh', designation: 'SACT-II', qualification: 'M.A. (Sanskrit)' },
    ],
    syllabus: [
      { title: 'Syllabus_BAP_SANS_2017-2018', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/Sanskrit-Syllabus_BAP_SANS_2017-2018.pdf', type: 'pdf' },
      { title: 'Syllabus_BASANS_2017-2018', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/Sanskrit-Syllabus_BASANS_2017-2018.pdf', type: 'pdf' },
      { title: 'Syllabus_BASANS_NEP2023-2024', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/Sanskrit-Syllabus_BASANS_NEP2023-2024.pdf', type: 'pdf' },
    ],
    routine: [
      { title: 'Lesson Plan 2023-24', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/2023-24-lesson-plan.pdf', type: 'pdf' },
    ],
    results: [
      { title: 'Question Bank 2025', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2025/10/2nd-semester-Question-paper-Final-2025.pdf', type: 'pdf' },
      { title: 'Question Bank', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/12/Question-Bank-Sanskrit.pdf', type: 'pdf' },
    ],
    notices: [
      { title: 'PO, CO, PSO', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/Sanskrit-Department-PO-CO-PSO.pdf', type: 'pdf' },
      { title: 'Activities & Achievements', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/Sanskrit-Department-Activities-Achievements.pdf', type: 'pdf' },
      { title: 'Important Links', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/SANSKRIT-IMPORTANT-LINKS.pdf', type: 'pdf' },
    ],
  },
  {
    name: 'Philosophy',
    href: 'https://galsimahavidyalaya.ac.in/department/philosophy/',
    color: 'from-indigo-500/20 to-violet-500/20',
    about: 'The Department of Philosophy explores fundamental questions about existence, knowledge, ethics, and reality. The curriculum covers Indian and Western philosophical traditions, logic, ethics, and contemporary philosophical issues. Students develop critical reasoning and analytical skills.',
    teachers: [
      { name: 'Barnali Bera', designation: 'SACT-II', qualification: 'M.A. (Philosophy)' },
      { name: 'Mousumi Ghosh', designation: 'SACT-II', qualification: 'M.A. (Philosophy)' },
    ],
    syllabus: [
      { title: 'Syllabus_BAP_PHIL_2017-2018', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/Philosophy-Syllabus_BAP_PHIL_2017-2018.pdf', type: 'pdf' },
      { title: 'Syllabus_BAPHIL_2017-2018', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/Philosophy-Syllabus_BAPHIL_2017-2018.pdf', type: 'pdf' },
    ],
    routine: [
      { title: 'NEP Lesson Plan 2023-2024', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/Nep-Lesson-Plan-2023-2024Philosophy.pdf', type: 'pdf' },
      { title: 'Lesson Plan 2022-2023', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/PHILOSOPHY-LESSON-PLAN-OF2022-2023.pdf', type: 'pdf' },
      { title: 'Lesson Plan 2021-2022', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/PHILOSOPHY-LESSON-PLAN-OF-2021-2022.pdf', type: 'pdf' },
      { title: 'Lesson Plan 2020-2021', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/PHILOSOPHY-LESSON-PLAN-2020-2021.pdf', type: 'pdf' },
      { title: 'Lesson Plan 2019-2020', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/PHILOSOPHY-LESSON-PLAN2019-2020.pdf', type: 'pdf' },
      { title: 'Lesson Plan 2018-2019', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/Lesson-Plan-2018-19PHILOSOPHY.pdf', type: 'pdf' },
    ],
    results: [
      { title: 'CO, PO, PSO', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/Philosophy-CO-PO-PSO.pdf', type: 'pdf' },
    ],
    notices: [
      { title: 'Activities & Achievements', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/Philosophy-Dept-Activities-and-Achievements.pdf', type: 'pdf' },
      { title: 'Important Links', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/PHILOSOPHY-IMPORTANT-LINKS.pdf', type: 'pdf' },
    ],
  },
  {
    name: 'Political Science',
    href: 'https://galsimahavidyalaya.ac.in/department/political-science/',
    color: 'from-red-500/20 to-rose-500/20',
    about: 'The Department of Political Science offers courses in political theory, Indian politics, international relations, and public administration. Students study constitutional frameworks, political ideologies, governance systems, and contemporary political issues both in India and globally.',
    teachers: [
      { name: 'Sk. Aftabuddin', designation: 'SACT-II', qualification: 'M.A. (Political Science)' },
      { name: 'Mousumi Ghosh', designation: 'SACT-II', qualification: 'M.A. (Political Science)' },
    ],
    syllabus: [
      { title: 'NEP B.A.(Hons.) Political Science 2023-2024', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/NEP-Syllabus-Political-Science-BU.pdf', type: 'pdf' },
      { title: 'Syllabus for B.A. General 2015-2016', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/PolScSyllabus_BAP_POLSC_2015-2016.pdf', type: 'pdf' },
      { title: 'Syllabus for B.A.(Gen.) CBCS 2017-2018', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/PolScSyllabus_BAP_POLSC_2017-2018%20GENERAL.pdf', type: 'pdf' },
      { title: 'Syllabus for B.A. Honours 2015-16', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/Syllabus_BAPOLSC_2015-2016.pdf', type: 'pdf' },
      { title: 'Syllabus for B.A.(Hons.) CBCS 2017-2018', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/PolScSyllabus_BA%20Hons.%20POL.%20SC_2017-2018%20CBCS.pdf', type: 'pdf' },
    ],
    routine: [
      { title: 'Lesson Plan 2023-24', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/Pol-Sc-LESSON-PLAN-2023-24merged.pdf', type: 'pdf' },
    ],
    results: [
      { title: 'PO, CO & PSO', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/Pol-Sc-Galsi-Mahavidyalaya-PO-CO-PSO.pdf', type: 'pdf' },
    ],
    notices: [
      { title: 'Activities & Achievements', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/PolScDepartmentActivities-Achievements.pdf', type: 'pdf' },
      { title: 'Important Links', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/PolScienceIMPORTANTLINKS.pdf', type: 'pdf' },
    ],
  },
  {
    name: 'Environmental Studies (ENVS)',
    href: 'https://galsimahavidyalaya.ac.in/department/envs/',
    color: 'from-teal-500/20 to-cyan-500/20',
    about: 'The Department of Environmental Studies addresses critical environmental issues and sustainable development. The curriculum covers ecology, biodiversity, pollution, climate change, and environmental policies. It is a compulsory course for all undergraduate students as per UGC guidelines.',
    teachers: [
      { name: 'Faculty Member', designation: 'Assistant Professor', qualification: 'M.Sc., Ph.D. (Environmental Science)' },
    ],
    syllabus: [
      { title: 'ENVS Syllabus (AECC)', url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2024/05/ENVS-Syllabus-AECC.pdf', type: 'pdf' },
    ],
    routine: [],
    results: [],
    notices: [],
  },
];
