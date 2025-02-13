import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  try {
    const { restaurantName, location } = await req.json()

    const prompt = `Write a blog post about ${restaurantName} in ${location}. 
    Include information about:
    1. The type of cuisine
    2. Popular dishes
    3. Atmosphere and ambiance
    4. Location and accessibility
    5. Price range
    Format the response as JSON with the following fields:
    {
      title: string,
      content: string,
      cuisineTags: string[],
      locationTags: string[],
      suggestedRating: "TBD"
    }`

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('No content generated')
    }
    
    return NextResponse.json(JSON.parse(content))
  } catch (error) {
    console.error('Error generating post:', error)
    return NextResponse.json(
      { error: 'Failed to generate post' },
      { status: 500 }
    )
  }
} 