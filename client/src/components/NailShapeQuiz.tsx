import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle, Square, Circle, Droplet, Diamond, Triangle, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Question {
  id: number;
  question: string;
  questionGe: string;
  options: {
    text: string;
    textGe: string;
    value: string;
  }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "What's your lifestyle?",
    questionGe: "რა არის თქვენი ცხოვრების სტილი?",
    options: [
      { text: "Active & hands-on", textGe: "აქტიური და პრაქტიკული", value: "active" },
      { text: "Professional & polished", textGe: "პროფესიონალური და დახვეწილი", value: "professional" },
      { text: "Creative & expressive", textGe: "შემოქმედებითი და გამომხატველი", value: "creative" },
      { text: "Relaxed & casual", textGe: "მოდუნებული და ყოველდღიური", value: "relaxed" },
    ],
  },
  {
    id: 2,
    question: "What length do you prefer?",
    questionGe: "რა სიგრძეს ამჯობინებთ?",
    options: [
      { text: "Short & practical", textGe: "მოკლე და პრაქტიკული", value: "short" },
      { text: "Medium length", textGe: "საშუალო სიგრძე", value: "medium" },
      { text: "Long & dramatic", textGe: "გრძელი და დრამატული", value: "long" },
    ],
  },
  {
    id: 3,
    question: "What's your style vibe?",
    questionGe: "რა არის თქვენი სტილი?",
    options: [
      { text: "Classic & timeless", textGe: "კლასიკური და მარადიული", value: "classic" },
      { text: "Modern & edgy", textGe: "თანამედროვე და თამამი", value: "modern" },
      { text: "Elegant & refined", textGe: "ელეგანტური და დახვეწილი", value: "elegant" },
      { text: "Bold & unique", textGe: "გაბედული და უნიკალური", value: "bold" },
    ],
  },
];

interface NailShape {
  name: string;
  nameGe: string;
  description: string;
  descriptionGe: string;
  bestFor: string[];
  icon: any;
}

const nailShapes: Record<string, NailShape> = {
  square: {
    name: "Square",
    nameGe: "კვადრატული",
    description: "Clean, modern edges perfect for a polished, professional look",
    descriptionGe: "სუფთა, თანამედროვე კიდეები შესანიშნავია დახვეწილი, პროფესიონალური ვიზუალისთვის",
    bestFor: ["professional", "short", "classic"],
    icon: Square,
  },
  round: {
    name: "Round",
    nameGe: "მრგვალი",
    description: "Soft, natural shape ideal for everyday wear and active lifestyles",
    descriptionGe: "რბილი, ბუნებრივი ფორმა იდეალურია ყოველდღიურად ტარებისა და აქტიური ცხოვრებისთვის",
    bestFor: ["active", "short", "relaxed"],
    icon: Circle,
  },
  oval: {
    name: "Oval",
    nameGe: "ოვალური",
    description: "Elegant, elongating shape that's universally flattering",
    descriptionGe: "ელეგანტური, გამახანგრძლივებელი ფორმა, რომელიც უნივერსალურია",
    bestFor: ["elegant", "medium", "classic"],
    icon: Droplet,
  },
  almond: {
    name: "Almond",
    nameGe: "ნუშის ფორმის",
    description: "Sophisticated, feminine shape with a gentle taper",
    descriptionGe: "დახვეწილი, ქალური ფორმა რბილი შევიწროებით",
    bestFor: ["elegant", "medium", "refined"],
    icon: Diamond,
  },
  stiletto: {
    name: "Stiletto",
    nameGe: "სტილეტო",
    description: "Dramatic, pointed shape for those who love to make a statement",
    descriptionGe: "დრამატული, წაწვეტებული ფორმა მათთვის, ვინც უყვარს განცხადების გაკეთება",
    bestFor: ["bold", "long", "modern"],
    icon: Triangle,
  },
  coffin: {
    name: "Coffin/Ballerina",
    nameGe: "კუბოს/ბალერინა",
    description: "Trendy, tapered square shape with a flat tip",
    descriptionGe: "ტრენდული, შევიწროებული კვადრატული ფორმა ბრტყელი წვერით",
    bestFor: ["modern", "long", "creative"],
    icon: Box,
  },
};

function calculateRecommendation(answers: string[]): string {
  // Simple scoring algorithm
  const scores: Record<string, number> = {
    square: 0,
    round: 0,
    oval: 0,
    almond: 0,
    stiletto: 0,
    coffin: 0,
  };

  answers.forEach((answer) => {
    Object.entries(nailShapes).forEach(([key, shape]) => {
      if (shape.bestFor.includes(answer)) {
        scores[key]++;
      }
    });
  });

  const recommended = Object.entries(scores).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  return recommended;
}

export default function NailShapeQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [recommendation, setRecommendation] = useState<string>("");

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz complete
      const result = calculateRecommendation(newAnswers);
      setRecommendation(result);
      setShowResults(true);
    }
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAnswers(answers.slice(0, -1));
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setRecommendation("");
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-theme-accent" />
          <h3 className="font-display text-3xl md:text-4xl mb-3 text-foreground">
            Find Your Perfect Nail Shape
          </h3>
          <p className="text-muted-foreground">
            იპოვე შენი იდეალური ფრჩხილის ფორმა
          </p>
        </div>

        {!showResults ? (
          <>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-muted rounded-none mb-8 overflow-hidden">
              <motion.div
                className="h-full bg-theme-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8 border-border">
                  <h4 className="text-2xl font-semibold mb-2 text-foreground">
                    {questions[currentQuestion].question}
                  </h4>
                  <p className="text-muted-foreground mb-6">
                    {questions[currentQuestion].questionGe}
                  </p>

                  <div className="space-y-3">
                    {questions[currentQuestion].options.map((option, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswer(option.value)}
                        className="w-full p-4 text-left rounded-none border border-border hover-elevate active-elevate-2 transition-all bg-card"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        data-testid={`quiz-option-${option.value}`}
                      >
                        <div className="font-medium text-foreground">{option.text}</div>
                        <div className="text-sm text-muted-foreground">{option.textGe}</div>
                      </motion.button>
                    ))}
                  </div>

                  {currentQuestion > 0 && (
                    <Button
                      variant="ghost"
                      onClick={goBack}
                      className="mt-6"
                      data-testid="quiz-back-button"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  )}
                </Card>
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-8 text-center border-border">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-theme-accent" />
              <h4 className="text-3xl font-display mb-2 text-foreground">
                Your Perfect Match!
              </h4>
              <p className="text-muted-foreground mb-8">თქვენი იდეალური არჩევანი</p>

              <div className="bg-theme-accent/10 rounded-none p-6 mb-6">
                <div className="mb-4 flex justify-center">
                  {(() => {
                    const Icon = nailShapes[recommendation].icon;
                    return <Icon className="w-16 h-16 text-theme-accent" />;
                  })()}
                </div>
                <h5 className="text-2xl font-bold mb-2 text-foreground">
                  {nailShapes[recommendation].name}
                </h5>
                <p className="text-lg text-foreground/80 mb-2">
                  {nailShapes[recommendation].nameGe}
                </p>
                <p className="text-muted-foreground mb-2">
                  {nailShapes[recommendation].description}
                </p>
                <p className="text-sm text-muted-foreground italic">
                  {nailShapes[recommendation].descriptionGe}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={resetQuiz}
                  variant="outline"
                  data-testid="quiz-restart-button"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => {
                    const bookingSection = document.getElementById("booking");
                    bookingSection?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-theme-accent"
                  data-testid="quiz-book-button"
                >
                  Book Appointment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
