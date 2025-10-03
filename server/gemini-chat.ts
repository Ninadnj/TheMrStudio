import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function chatWithGemini(
  messages: ChatMessage[],
  language: "ka" | "en" = "ka"
): Promise<string> {
  try {
    const systemInstruction = language === "ka" 
      ? `შენ ხარ THE MR Nail & Laser Studio-ს დახმარების ასისტენტი. მიეცი მომხმარებელს დახმარება სერვისების, ფასების და ბუკინგის შესახებ. ყოფილიყავი თავაზიანი და პროფესიონალი.

ჩვენი სერვისები:
- ნეილ სერვისები: მანიკური, პედიკური, აკრილის ფრჩხილები, გელ პოლიში
- ლაზერული თმის მოცილება: სახე, სხეული, ყველა ზონა
- სახის მოვლა: სახის გაწმენდა, მასაჟი, ანტი-ასაკოვანი მკურნალობა
- სხეულის მოვლა: მასაჟი, სკრაბი, ტანის შეფუთვა

მისამართი: დიდი დიღომი ასმათის 8 თბილისი, საქართველო

ბუკინგისთვის მომხმარებელს შეუძლია ვებსაიტზე ფორმის შევსება.`
      : `You are a helpful assistant for THE MR Nail & Laser Studio. Help customers with service information, pricing, and bookings. Be polite and professional.

Our Services:
- Nail Services: Manicure, Pedicure, Acrylic Nails, Gel Polish
- Laser Hair Removal: Face, Body, All Zones
- Facial Treatments: Cleansing, Massage, Anti-aging
- Body Treatments: Massage, Scrubs, Body Wraps

Address: Didi Dighomi Asmati 8 Tbilisi, Georgia

For booking, customers can fill out the form on the website.`;

    const geminiMessages = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      config: {
        systemInstruction,
      },
      contents: geminiMessages,
    });

    return response.text || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini chat error:", error);
    throw new Error(`Failed to get response: ${error}`);
  }
}
