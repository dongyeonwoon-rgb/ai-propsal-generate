import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { url, prompt } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // 1. Fetch website content
        let websiteContent = '';
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; AIProposalBot/1.0; +http://example.com)',
                },
            });
            if (response.ok) {
                const html = await response.text();
                const $ = cheerio.load(html);

                // Remove scripts, styles, and navigational elements
                $('script, style, nav, footer, iframe, noscript').remove();

                // Extract text
                websiteContent = $('body').text().replace(/\s+/g, ' ').trim();
                // Limit context size to avoid token overflow
                websiteContent = websiteContent.slice(0, 15000);
            } else {
                websiteContent = `Could not fetch content from ${url} (Status: ${response.status})`;
            }
        } catch (error) {
            console.error("Error fetching URL:", error);
            websiteContent = `Could not fetch content from ${url} due to a network error.`;
        }

        // 2. Optional: Fetch extra context from Supabase (e.g., Saju Manse-ryeok data)
        // This is a read-only query using the anon key.
        let sajuContext = '';
        try {
            if (supabase) {
                // Example query: replace 'saju_data' with your actual table and query logic
                const { data, error } = await supabase
                    .from('saju_data')
                    .select('description')
                    .limit(1)
                    .single();

                if (data && !error) {
                    sajuContext = `\n\nAdditional Context (Saju): ${data.description}`;
                }
            }
        } catch (supabaseError) {
            console.error("Supabase Query Error:", supabaseError);
            // We ignore the error and proceed without the extra context
        }

        // 3. Call OpenRouter API
        const openrouterApiKey = process.env.OPENROUTER_API_KEY;

        if (!openrouterApiKey) {
            return NextResponse.json({
                error: 'OpenRouter API key is not configured. Please add OPENROUTER_API_KEY to your .env.local file.'
            }, { status: 500 });
        }

        const messages = [
            {
                role: "system",
                content: prompt || "You are an expert business consultant. Generate a professional business proposal based on the following context. Format the output in Markdown."
            },
            {
                role: "user",
                content: `Target URL: ${url}\n\nWebsite Context:\n${websiteContent}${sajuContext}\n\nPlease generate the proposal in Markdown format.`
            }
        ];

        const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openrouterApiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
                "X-Title": "AI Proposal Generator"
            },
            body: JSON.stringify({
                model: "anthropic/claude-3-opus",
                messages: messages,
            })
        });

        if (!orRes.ok) {
            const errorText = await orRes.text();
            console.error("OpenRouter API Error:", errorText);
            return NextResponse.json({ error: `OpenRouter API error: ${orRes.status}` }, { status: 500 });
        }

        const orData = await orRes.json();
        const proposal = orData.choices?.[0]?.message?.content || "No content generated.";

        return NextResponse.json({ proposal });

    } catch (error: any) {
        console.error("Generate API Error:", error);
        return NextResponse.json(
            { error: error.message || 'An error occurred during generation' },
            { status: 500 }
        );
    }
}
