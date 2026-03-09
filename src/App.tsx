/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  ClipboardCheck, 
  User, 
  Calendar, 
  MapPin, 
  BarChart3, 
  AlertCircle,
  CheckCircle2,
  Info,
  RotateCcw,
  Download,
  Upload,
  Eye,
  EyeOff,
  FileJson,
  FileDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- Types ---

interface ChildInfo {
  name: string;
  age: string;
  dob: string;
  placeOfBirth: string;
}

interface Question {
  id: number;
  text: string;
  description?: string;
}

interface Section {
  id: string;
  title: string;
  questions: Question[];
}

interface AssessmentData {
  childInfo: ChildInfo;
  answers: Record<number, number>;
  metadata: {
    totalScore: number;
    timestamp: string;
    formattedDateTime: string;
    version: string;
  };
}

// --- Data ---

const SECTIONS: Section[] = [
  {
    id: 'social',
    title: 'I. Social Relationship and Reciprocity',
    questions: [
      { id: 1, text: 'Has poor eye contact', description: 'Individuals with autism avoid looking people in the eye. They are unable to maintain eye contact as expected for a given age or required of social norms. Eye contact may be unusual such as gazing for too long on one spot or looking sideways.' },
      { id: 2, text: 'Lacks social smile', description: 'Individuals with autism do not smile when meeting people or in reciprocation. A smile that reflects social response and recognition cannot be elicited from such persons.' },
      { id: 3, text: 'Remains aloof', description: 'Individuals with autism may remain aloof, self-absorbed, withdrawn, and not responsive to people or environment. They seem to be preoccupied with their self and be away from the social world around. They hardly respond to, or initiate contact with others. There is lack of age appropriate pretend play.' },
      { id: 4, text: 'Does not reach out to others', description: 'Individuals with autism do not interact with other people and remain socially unresponsive. They do not initiate, seek, or respond to social interactions. They may not respond to their name, and even if they do, it may not be appropriate.' },
      { id: 5, text: 'Unable to relate to people', description: 'Individuals with autism do not initiate contact with others and may not relate to people as expected of their age. Reminders are required to attune the individuals with autism to the presence of people and social situations.' },
      { id: 6, text: 'Unable to respond to social/environmental cues', description: 'Individuals with autism are not responsive to social and environmental demands or expectations. They show behavior which is not synchronous with the demands/ requirements of the social environment.' },
      { id: 7, text: 'Engages in solitary and repetitive play activities', description: 'Individuals with autism play alone most of the time or prefer solitary activities. They avoid playing with others and may not engage in group oriented activities or tasks at all.' },
      { id: 8, text: 'Unable to take turns in social interaction', description: 'Individuals with autism do not comprehend the significance of taking turns in reciprocal interaction with others. They do not wait until their turn comes or the others\' turn ends.' },
      { id: 9, text: 'Does not maintain peer relationships', description: 'Individuals with autism do not develop age appropriate friendships. They may not engage in age appropriate peer interactions or maintain peer relationships as is socially expected.' },
    ]
  },
  {
    id: 'emotional',
    title: 'II. Emotional Responsiveness',
    questions: [
      { id: 10, text: 'Shows inappropriate emotional response', description: 'Persons with autism do not show the expected feeling in a social situation. They express inappropriate emotional responses like laughing when scolded or spanked and inappropriate degree of response like excessive crying or laughing that is unwarranted.' },
      { id: 11, text: 'Shows exaggerated emotions', description: 'Persons with autism may show anxiety or fear which is excessive in nature and which may be triggered off without an apparent reason. At times, it may be exaggerated or atypical.' },
      { id: 12, text: 'Engages in self-stimulating emotions', description: 'Individuals with autism may engage in self talk that is inappropriate for their age. The autistic individual may smile to self without any apparent reason.' },
      { id: 13, text: 'Lacks fear of danger', description: 'Persons with autism may not show fear of hazards or dangers which others of the same age would show or know.' },
      { id: 14, text: 'Excited or agitated for no apparent reason', description: 'Persons with autism may show excitement, over activity or agitation that is both excessive and unwarranted. The autistic child moves around with brisk energy and may be difficult to control.' },
    ]
  },
  {
    id: 'speech',
    title: 'III. Speech-Language and Communication',
    questions: [
      { id: 15, text: 'Acquired speech and lost it', description: 'Speech development is not age-appropriate. The autistic individual may have developed speech, but lost it subsequently. 50% of autistic may be mute.' },
      { id: 16, text: 'Has difficulty in using non-verbal language or gestures to communicate', description: 'Persons with autism find it difficult to express their needs non-verbally and may also have difficulty in understanding the non-verbal language of others. Instead of gesturing or pointing, they may lead others to the desired object by dragging or pulling the latter\'s hand.' },
      { id: 17, text: 'Engages in stereotyped and repetitive use of language', description: 'Persons with autism may repeat a word, phrase or sentence out of context. They repeat the same statement many times.' },
      { id: 18, text: 'Engages in echolalic speech', description: 'Persons with autism may repeat or echo questions or statements made by other people. They may not understand that they have to answer the questions.' },
      { id: 19, text: 'Produces infantile squeals/ unusual noises', description: 'Persons with autism may squeal, make bizarre noises and produce unintelligible speech like sounds. They may produce speech like sounds which lack meaning.' },
      { id: 20, text: 'Unable to initiate or sustain conversation with others', description: 'Persons with autism may not be able to initiate or sustain conversation with others.' },
      { id: 21, text: 'Uses jargon or meaningless words', description: 'Persons with autism may use strange or meaningless words which convey no meaning.' },
      { id: 22, text: 'Uses pronoun reversals', description: 'Persons with autism may show difficulty in the use of pronouns. They frequently reverse pronouns such as “I” for “You”.' },
      { id: 23, text: 'Unable to grasp pragmatics of communication (real meaning)', description: 'Persons with autism have difficulty in understanding the true intent of speech of others. They may not understand the pragmatics of speech communication.' },
    ]
  },
  {
    id: 'behavior',
    title: 'IV. Behaviour Patterns',
    questions: [
      { id: 24, text: 'Engages in stereotyped and repetitive motor mannerisms', description: 'Persons with autism may engage in self-stimulatory behavior in the form of flapping of hands or fingers, body rocking or using an object for this purpose.' },
      { id: 25, text: 'Shows attachment to inanimate objects', description: 'Individuals with autism may be staunchly attached to certain inanimate objects which they insist on keeping with themselves such as string, rock, pen, stick, toy, bottle and the like.' },
      { id: 26, text: 'Shows hyperactivity/restlessness', description: 'Individuals with autism may be restless with boundless energy which makes it difficult for others to control them. The hyperactivity interferes with their learning and performance of tasks.' },
      { id: 27, text: 'Exhibits aggressive behavior', description: 'Persons with autism may show unprovoked aggression and socially inappropriate behavior such as hitting, kicking and pinching.' },
      { id: 28, text: 'Throws temper tantrums', description: 'Individuals with autism may show temper tantrums in the form of head banging, screaming, and yelling etc. Such behaviors are emitted when frustrated.' },
      { id: 29, text: 'Engages in self-injurious behavior', description: 'Persons with autism may indulge in self-injurious behaviors like biting, hitting or mutilating self. Such individuals have to be constantly supervised to prevent them injuring themselves.' },
      { id: 30, text: 'Insists on sameness', description: 'Persons with autism may resist change in their routine and insist that things be the same as they were. Such individuals may insist on continuing the same activity and it would be very difficult to distract them from such repetitive activities.' },
    ]
  },
  {
    id: 'sensory',
    title: 'V. Sensory Aspects',
    questions: [
      { id: 31, text: 'Unusually sensitive to sensory stimuli', description: 'Persons with autism may react strongly to certain sounds, light, touch or tastes by closing their ears, eyes or refusing to eat food of certain consistency. They may actively avoid certain sensory stimuli.' },
      { id: 32, text: 'Stares into space for long periods of time', description: 'Persons with autism may stare at some distant spot or space for long periods of time. They seem to be unaware of surroundings when thus occupied.' },
      { id: 33, text: 'Has difficulty in tracking objects', description: 'Persons with autism may have difficulty in tracking objects or persons in motion. They are unable to follow or fix their gaze on moving objects or persons for the required period of time.' },
      { id: 34, text: 'Has unusual vision', description: 'Persons with autism may be able to observe tiny details which may not be apparent to others. Such individuals focus their attention on some insignificant part of an object that is generally ignored by others.' },
      { id: 35, text: 'Insensitive to pain', description: 'Persons with autism may hardly react to pain. They seem not to be distressed or cry when hurt. They seem to have high thresholds for pain.' },
      { id: 36, text: 'Responds to objects unusually by smelling, touching or tasting', description: 'Individuals with autism may go around exploring their environment by smelling, touching or tasting objects. Some of them may not show appropriate use of objects or toys.' },
    ]
  },
  {
    id: 'cognitive',
    title: 'VI. Cognitive Aspects',
    questions: [
      { id: 37, text: 'Inconsistent attention and concentration', description: 'It is difficult to arouse the attention of individuals with autism. They do not concentrate, and if they do, then it may not be on relevant aspects of the object or event. As a result of this, they may be inconsistent in their response.' },
      { id: 38, text: 'Shows delay in responding', description: 'Persons with autism do not respond to instructions promptly or respond after a considerable delay. Quick response to instructions is hardly ever to be expected.' },
      { id: 39, text: 'Has unusual memory of some kind', description: 'Persons with autism may show memory for things which most of the individuals would have long forgotten. Some of them have exceptional ability to remember things from the distant past.' },
      { id: 40, text: 'Has \'savant\' ability', description: 'Persons with autism may have special or unusual ability in some areas like reading early, mathematical feats or artistic talent. Some of them may show superior ability, but in a restricted field of interest.' },
    ]
  }
];

const OPTIONS = [
  { label: 'Rarely (Upto 20%)', score: 1 },
  { label: 'Sometimes (21-40%)', score: 2 },
  { label: 'Frequently (41-60%)', score: 3 },
  { label: 'Mostly (61-80%)', score: 4 },
  { label: 'Always (81-100%)', score: 5 },
];

// --- Components ---

export default function App() {
  const [step, setStep] = useState(0); // 0: Info, 1-6: Sections, 7: Results
  const [childInfo, setChildInfo] = useState<ChildInfo>({
    name: '',
    age: '',
    dob: '',
    placeOfBirth: ''
  });
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showDetailedResponses, setShowDetailedResponses] = useState(false);
  const [activeInfoId, setActiveInfoId] = useState<number | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const totalSteps = SECTIONS.length + 2;

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleAnswer = (questionId: number, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  };

  const resetForm = () => {
    setStep(0);
    setChildInfo({ name: '', age: '', dob: '', placeOfBirth: '' });
    setAnswers({});
    setShowDetailedResponses(false);
  };

  const sectionScores = useMemo(() => {
    return SECTIONS.map(section => {
      const score = section.questions.reduce((acc, q) => acc + (answers[q.id] || 0), 0);
      return { title: section.title, score };
    });
  }, [answers]);

  const totalScore = useMemo(() => {
    return sectionScores.reduce((acc, section) => acc + section.score, 0);
  }, [sectionScores]);

  const getInterpretation = (score: number) => {
    if (score < 70) return { label: 'Normal / No Autism', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (score <= 106) return { label: 'Mild Autism', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    if (score <= 153) return { label: 'Moderate Autism', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { label: 'Severe Autism', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' };
  };

  const isSectionComplete = (sectionIndex: number) => {
    const section = SECTIONS[sectionIndex];
    return section.questions.every(q => answers[q.id] !== undefined);
  };

  const isInfoComplete = childInfo.name && childInfo.age;

  // --- JSON Handlers ---

  const handleSaveJson = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const formattedDateTime = now.toLocaleString();

    const data: AssessmentData = {
      childInfo,
      answers,
      metadata: {
        totalScore,
        timestamp: now.toISOString(),
        formattedDateTime,
        version: '1.0'
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ISAA_${childInfo.name.replace(/\s+/g, '_') || 'Child'}_${dateStr}_${timeStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as AssessmentData;
        
        if (data.childInfo && data.answers) {
          setChildInfo(data.childInfo);
          setAnswers(data.answers);
          setStep(totalSteps - 1); // Jump to results
        } else {
          alert('Invalid JSON format. Please upload a valid ISAA assessment file.');
        }
      } catch (err) {
        alert('Error parsing JSON file.');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadPdf = (responsesOnly: boolean = false) => {
    setIsGeneratingPdf(true);
    
    try {
      const doc = new jsPDF();
      const margin = 20;
      let y = 20;

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(responsesOnly ? 'ISAA Assessment Responses' : 'ISAA Assessment Report', margin, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, y);
      y += 15;

      // Child Info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Child Information', margin, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Name: ${childInfo.name}`, margin, y);
      y += 5;
      doc.text(`Age: ${childInfo.age}`, margin, y);
      y += 5;
      doc.text(`DOB: ${childInfo.dob || 'N/A'}`, margin, y);
      y += 5;
      doc.text(`Place: ${childInfo.placeOfBirth || 'N/A'}`, margin, y);
      y += 15;

      if (!responsesOnly) {
        // Results summary
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Assessment Results', margin, y);
        y += 10;
        
        doc.setFontSize(12);
        doc.text(`Total Score: ${totalScore}`, margin, y);
        y += 7;
        doc.text(`Interpretation: ${getInterpretation(totalScore).label}`, margin, y);
        y += 15;
      }

      // Detailed Responses
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Detailed Responses', margin, y);
      y += 10;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      SECTIONS.forEach((section) => {
        // Check for page break
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.text(section.title, margin, y);
        y += 7;
        doc.setFont('helvetica', 'normal');

        section.questions.forEach((q) => {
          const answer = answers[q.id] || 0;
          const optionLabel = OPTIONS.find(o => o.score === answer)?.label.split(' (')[0] || 'N/A';
          
          const text = `${q.id}. ${q.text}: ${answer} (${optionLabel})`;
          const splitText = doc.splitTextToSize(text, 170);
          
          // Check for page break
          if (y + (splitText.length * 5) > 280) {
            doc.addPage();
            y = 20;
          }
          
          doc.text(splitText, margin, y);
          y += (splitText.length * 5) + 2;
        });
        y += 5;
      });

      const fileName = responsesOnly 
        ? `ISAA_Responses_${childInfo.name.replace(/\s+/g, '_') || 'Child'}.pdf`
        : `ISAA_Report_${childInfo.name.replace(/\s+/g, '_') || 'Child'}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-200 print:bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 print:max-w-none print:p-0">
        
        {/* Header - Hidden on Print */}
        <header className="mb-12 text-center print:hidden">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-900 text-stone-50 mb-6 shadow-xl">
            <ClipboardCheck size={32} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">ISAA Assessment</h1>
          <p className="text-stone-500 max-w-md mx-auto italic serif">
            Indian Scale for Assessment of Autism - A tool for assessing changes in children
          </p>
        </header>

        {/* Print Only Header */}
        <header className="hidden print:block mb-8 border-b-2 border-stone-900 pb-6">
          <h1 className="text-3xl font-bold uppercase tracking-tight">ISAA Assessment Report</h1>
          <p className="text-stone-500 mt-1 italic">Indian Scale for Assessment of Autism</p>
          <p className="text-xs font-mono mt-4 text-stone-400">Generated on: {new Date().toLocaleString()}</p>
        </header>

        {/* Progress Bar - Hidden on Print */}
        {step > 0 && step < totalSteps - 1 && (
          <div className="mb-12 print:hidden">
            <div className="flex justify-between text-xs font-mono uppercase tracking-widest text-stone-400 mb-3">
              <span>Progress</span>
              <span>{Math.round(((step) / (totalSteps - 2)) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-stone-900"
                initial={{ width: 0 }}
                animate={{ width: `${((step) / (totalSteps - 2)) * 100}%` }}
                transition={{ duration: 0.5, ease: "circOut" }}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden print:shadow-none print:border-none print:rounded-none">
          <AnimatePresence mode="wait">
            
            {/* Step 0: Child Info */}
            {step === 0 && (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8 md:p-12 print:p-0"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
                  <div className="flex items-center gap-3">
                    <User className="text-stone-400" size={24} />
                    <h2 className="text-2xl font-semibold">Child Information</h2>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleLoadJson} 
                      accept=".json" 
                      className="hidden" 
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all"
                    >
                      <Upload size={16} />
                      Load JSON
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-widest text-stone-500">Full Name</label>
                    <input 
                      type="text"
                      value={childInfo.name}
                      onChange={e => setChildInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter child's name"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-widest text-stone-500">Age</label>
                    <input 
                      type="text"
                      value={childInfo.age}
                      onChange={e => setChildInfo(prev => ({ ...prev, age: e.target.value }))}
                      placeholder="e.g. 5 years"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-widest text-stone-500">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                      <input 
                        type="text"
                        value={childInfo.dob}
                        onChange={e => setChildInfo(prev => ({ ...prev, dob: e.target.value }))}
                        placeholder="7 January 2019"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-widest text-stone-500">Place of Birth</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                      <input 
                        type="text"
                        value={childInfo.placeOfBirth}
                        onChange={e => setChildInfo(prev => ({ ...prev, placeOfBirth: e.target.value }))}
                        placeholder="City, State"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex justify-end">
                  <button
                    onClick={handleNext}
                    disabled={!isInfoComplete}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all shadow-lg ${
                      isInfoComplete 
                        ? 'bg-stone-900 text-stone-50 hover:bg-stone-800 hover:-translate-y-0.5 active:translate-y-0' 
                        : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    Start Assessment
                    <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Steps 1-6: Sections */}
            {step > 0 && step <= SECTIONS.length && (
              <motion.div
                key={`section-${step}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12"
              >
                <div className="mb-10">
                  <h2 className="text-2xl font-bold mb-2">{SECTIONS[step - 1].title}</h2>
                  <p className="text-stone-500 text-sm">Please select the frequency that best describes the child's behavior.</p>
                </div>

                <div className="space-y-10">
                  {SECTIONS[step - 1].questions.map((q, idx) => (
                    <div key={q.id} className="space-y-4">
                      <div className="flex gap-4 items-start">
                        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-stone-100 text-stone-500 flex items-center justify-center font-mono text-sm">
                          {q.id}
                        </span>
                        <div className="flex-grow">
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-medium pt-0.5">{q.text}</p>
                            {q.description && (
                              <button
                                onClick={() => setActiveInfoId(activeInfoId === q.id ? null : q.id)}
                                className={`p-1 rounded-full transition-colors ${
                                  activeInfoId === q.id ? 'bg-stone-900 text-stone-50' : 'text-stone-400 hover:bg-stone-100'
                                }`}
                                title="Click for more information"
                              >
                                <Info size={16} />
                              </button>
                            )}
                          </div>
                          <AnimatePresence>
                            {activeInfoId === q.id && q.description && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-2 p-4 bg-stone-50 rounded-xl border border-stone-200 text-sm text-stone-600 leading-relaxed italic">
                                  {q.description}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 ml-12">
                        {OPTIONS.map((opt) => (
                          <button
                            key={opt.score}
                            onClick={() => handleAnswer(q.id, opt.score)}
                            className={`px-3 py-3 rounded-xl text-xs font-medium transition-all border ${
                              answers[q.id] === opt.score
                                ? 'bg-stone-900 text-stone-50 border-stone-900 shadow-md'
                                : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400'
                            }`}
                          >
                            <div className="mb-1 opacity-60">Score {opt.score}</div>
                            {opt.label.split(' (')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-16 pt-8 border-t border-stone-100 flex justify-between items-center">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-stone-600 hover:bg-stone-50 transition-all"
                  >
                    <ChevronLeft size={20} />
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!isSectionComplete(step - 1)}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all shadow-lg ${
                      isSectionComplete(step - 1)
                        ? 'bg-stone-900 text-stone-50 hover:bg-stone-800 hover:-translate-y-0.5 active:translate-y-0' 
                        : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    {step === SECTIONS.length ? 'View Results' : 'Next Section'}
                    <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 7: Results */}
            {step === totalSteps - 1 && (
              <motion.div
                key="results"
                ref={resultsRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 md:p-12 print:p-0"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 print:hidden">
                  <div className="text-center md:text-left">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-stone-900 text-stone-50 mb-6 shadow-2xl">
                      <BarChart3 size={40} />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Assessment Results</h2>
                    <p className="text-stone-500">Based on the ISAA scoring criteria</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => handleDownloadPdf(false)}
                      disabled={isGeneratingPdf}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-stone-900 text-stone-50 hover:bg-stone-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingPdf ? (
                        <div className="w-4 h-4 border-2 border-stone-50/30 border-t-stone-50 rounded-full animate-spin" />
                      ) : (
                        <FileDown size={18} />
                      )}
                      {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
                    </button>
                    <button
                      onClick={() => handleDownloadPdf(true)}
                      disabled={isGeneratingPdf}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileDown size={18} />
                      Responses Only
                    </button>
                    <button
                      onClick={handleSaveJson}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all shadow-sm"
                    >
                      <Download size={18} />
                      Save JSON
                    </button>
                    <button
                      onClick={() => setShowDetailedResponses(!showDetailedResponses)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm ${
                        showDetailedResponses 
                          ? 'bg-stone-100 text-stone-600' 
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {showDetailedResponses ? <EyeOff size={18} /> : <Eye size={18} />}
                      {showDetailedResponses ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                </div>

                {/* Child Summary */}
                <div className="bg-stone-50 rounded-2xl p-6 mb-10 border border-stone-200 grid grid-cols-2 md:grid-cols-4 gap-4 print:bg-white print:border-stone-100">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-1">Name</p>
                    <p className="font-semibold">{childInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-1">Age</p>
                    <p className="font-semibold">{childInfo.age}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-1">DOB</p>
                    <p className="font-semibold">{childInfo.dob || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-1">Place</p>
                    <p className="font-semibold truncate">{childInfo.placeOfBirth || 'N/A'}</p>
                  </div>
                </div>

                {/* Total Score Card */}
                <div className={`rounded-3xl p-8 mb-10 border-2 text-center shadow-sm print:shadow-none print:border-stone-200 ${getInterpretation(totalScore).bg} ${getInterpretation(totalScore).border}`}>
                  <p className="text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Total ISAA Score</p>
                  <div className={`text-7xl font-black mb-4 ${getInterpretation(totalScore).color}`}>
                    {totalScore}
                  </div>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider ${getInterpretation(totalScore).bg} ${getInterpretation(totalScore).color} border border-current/20`}>
                    {getInterpretation(totalScore).label}
                  </div>
                </div>

                {/* Detailed Responses Section - Always visible on print if requested or just show it */}
                <div className={`${showDetailedResponses ? 'block' : 'hidden'} print:block overflow-hidden mb-12`}>
                  <div className="bg-stone-50 rounded-3xl p-8 border border-stone-200 print:bg-white print:p-0 print:border-none">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 print:text-lg">
                      <FileJson size={24} className="text-stone-400 print:hidden" />
                      Detailed Responses
                    </h3>
                    <div className="space-y-8 print:space-y-6">
                      {SECTIONS.map((section, sIdx) => (
                        <div key={section.id} className="space-y-3 break-inside-avoid">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-stone-400 border-b border-stone-200 pb-2 print:text-stone-600">
                            {section.title}
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {section.questions.map((q) => (
                              <div key={q.id} className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-white transition-colors print:py-1 print:px-0">
                                <div className="flex gap-3 items-center">
                                  <span className="text-[10px] font-mono text-stone-400 w-4">{q.id}</span>
                                  <span className="text-sm text-stone-700 print:text-xs">{q.text}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-medium text-stone-500 print:text-[10px]">
                                    {OPTIONS.find(o => o.score === answers[q.id])?.label.split(' (')[0]}
                                  </span>
                                  <span className="w-8 h-8 rounded-lg bg-stone-900 text-stone-50 flex items-center justify-center font-mono text-xs font-bold print:bg-white print:text-stone-900 print:border print:border-stone-200">
                                    {answers[q.id]}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section Breakdown */}
                <div className="space-y-4 mb-12 break-inside-avoid">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-6 print:mb-4">
                    <Info size={20} className="text-stone-400 print:hidden" />
                    Section-wise Breakdown
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-1">
                    {sectionScores.map((s, i) => (
                      <div key={i} className="p-5 rounded-2xl border border-stone-100 bg-white shadow-sm flex justify-between items-center print:p-3 print:border-stone-100 print:shadow-none">
                        <div className="max-w-[70%]">
                          <p className="text-xs text-stone-400 font-mono mb-1">Section {i + 1}</p>
                          <p className="font-medium text-sm leading-tight print:text-xs">{s.title.split('. ')[1]}</p>
                        </div>
                        <div className="text-2xl font-bold text-stone-900 print:text-lg">
                          {s.score}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interpretation Guide */}
                <div className="bg-white rounded-2xl p-6 border border-stone-200 mb-12 break-inside-avoid print:border-stone-100 print:p-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-4 print:mb-2">Scoring Guide</h4>
                  <div className="space-y-3 print:space-y-1">
                    <div className="flex justify-between items-center text-sm print:text-xs">
                      <span className="text-stone-600">Normal / No Autism</span>
                      <span className="font-mono font-bold text-emerald-600">&lt; 70</span>
                    </div>
                    <div className="flex justify-between items-center text-sm print:text-xs">
                      <span className="text-stone-600">Mild Autism</span>
                      <span className="font-mono font-bold text-amber-600">70 - 106</span>
                    </div>
                    <div className="flex justify-between items-center text-sm print:text-xs">
                      <span className="text-stone-600">Moderate Autism</span>
                      <span className="font-mono font-bold text-orange-600">107 - 153</span>
                    </div>
                    <div className="flex justify-between items-center text-sm print:text-xs">
                      <span className="text-stone-600">Severe Autism</span>
                      <span className="font-mono font-bold text-rose-600">&gt; 153</span>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="flex gap-4 p-6 rounded-2xl bg-stone-100 text-stone-600 text-xs leading-relaxed mb-12 print:bg-white print:border print:border-stone-100 print:mb-4">
                  <AlertCircle className="flex-shrink-0 text-stone-400 print:hidden" size={20} />
                  <p>
                    <strong>Disclaimer:</strong> This tool is for informational purposes only and does not constitute a medical diagnosis. 
                    The ISAA is a clinical tool intended for use by trained professionals. Please consult with a qualified pediatrician 
                    or child psychologist for a formal evaluation.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4 print:hidden">
                  <button
                    onClick={resetForm}
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all shadow-sm"
                  >
                    <RotateCcw size={20} />
                    Start New Assessment
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* Footer Info */}
        <footer className="mt-12 text-center text-stone-400 text-xs">
          <p>© {new Date().getFullYear()} ISAA Assessment Tool • Professional Grade Evaluation</p>
        </footer>
      </div>
    </div>
  );
}
