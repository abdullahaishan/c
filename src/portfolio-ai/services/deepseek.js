import axios from 'axios';

// ===========================================
// 🔧 IMPORTANT: استبدل هذا بمفتاح DeepSeek API الخاص بك
// ===========================================
const DEEPSEEK_API_KEY = 'YOUR_DEEPSEEK_API_KEY';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export const deepseekService = {
  // تحليل السيرة الذاتية
  async analyzeResume(resumeText) {
    try {
      const prompt = `
        You are an expert resume parser. Analyze the following resume and extract information in valid JSON format ONLY.
        
        Resume content:
        ${resumeText}
        
        Return a JSON object with this exact structure:
        {
          "personal_info": {
            "name": "full name",
            "email": "email",
            "phone": "phone number",
            "location": "location",
            "summary": "professional summary"
          },
          "skills": [
            {"name": "skill name", "category": "Frontend/Backend/Design/Soft Skills", "proficiency": 0-100}
          ],
          "experience": [
            {
              "job_title": "title",
              "company": "company name",
              "start_date": "start date",
              "end_date": "end date or Present",
              "description": "description",
              "technologies": ["tech1", "tech2"]
            }
          ],
          "education": [
            {
              "degree": "degree name",
              "field_of_study": "field",
              "institution": "institution name",
              "start_date": "start date",
              "end_date": "end date"
            }
          ],
          "projects": [
            {
              "title": "project title",
              "description": "description",
              "technologies": ["tech1", "tech2"]
            }
          ],
          "certificates": [
            {
              "name": "certificate name",
              "issuer": "issuing organization"
            }
          ]
        }
        
        Return ONLY the JSON, no other text.
      `;

      const response = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a JSON-only resume parser. Always return valid JSON without any additional text.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 4000
        },
        {
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      
      // Extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('No JSON found in response');
    } catch (error) {
      console.error('DeepSeek API Error:', error);
      throw error;
    }
  },

  // تحسين المحتوى
  async enhanceContent(content, type) {
    const prompts = {
      bio: 'Improve this professional bio to be more engaging and impactful:',
      project: 'Write a compelling project description:',
      skill: 'Suggest related skills and provide a brief description:'
    };

    try {
      const response = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: `${prompts[type]}\n\n${content}`
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Enhancement error:', error);
      return content;
    }
  }
};