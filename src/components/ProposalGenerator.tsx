"use client";

import { useState } from "react";
import { marked } from "marked";

export default function ProposalGenerator() {
    const [url, setUrl] = useState("");
    const [prompt, setPrompt] = useState(
        "Please analyze the provided content and generate a professional business proposal. Include an executive summary, proposed solution, timeline, and pricing based on the context. Use clear headings."
    );
    const [isPromptExpanded, setIsPromptExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [proposal, setProposal] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleGenerate = async () => {
        if (!url) return;
        setIsLoading(true);
        setProposal("");
        setErrorMsg("");

        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ url, prompt })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to generate proposal");
            }

            setProposal(data.proposal);
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMarkdown = (markdownText: string) => {
        return { __html: marked.parse(markdownText) as string };
    };

    return (
        <div className="generator-container">
            <div className="glass-card">
                <div style={{ marginBottom: "20px" }}>
                    <label htmlFor="url-input" style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                        Target URL
                    </label>
                    <input
                        id="url-input"
                        type="url"
                        className="glass-input"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                    />
                </div>

                <div style={{ marginBottom: "24px" }}>
                    <button
                        type="button"
                        onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                        style={{
                            background: "none",
                            border: "none",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "4px 0",
                            fontFamily: "inherit",
                            fontSize: "0.95rem"
                        }}
                    >
                        <span style={{ fontSize: "0.8rem" }}>{isPromptExpanded ? "▼" : "▶"}</span>
                        <span style={{ fontWeight: 500 }}>Customize AI Prompt</span>
                    </button>

                    {isPromptExpanded && (
                        <div style={{ marginTop: "12px" }}>
                            <textarea
                                className="glass-input"
                                style={{ minHeight: "120px", resize: "vertical", lineHeight: "1.5" }}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Enter custom instructions for the AI..."
                            />
                        </div>
                    )}
                </div>

                {errorMsg && (
                    <div style={{
                        color: "#e74c3c",
                        marginBottom: "16px",
                        padding: "16px",
                        background: "rgba(231, 76, 60, 0.1)",
                        borderRadius: "8px",
                        border: "1px solid rgba(231, 76, 60, 0.2)"
                    }}>
                        {errorMsg}
                    </div>
                )}

                <button
                    className="glass-button"
                    onClick={handleGenerate}
                    disabled={!url || isLoading}
                    style={{ width: "100%" }}
                >
                    {isLoading ? (
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className="spinner"></span> Generating...
                        </span>
                    ) : "Generate Proposal"}
                </button>
            </div>

            {proposal && (
                <div className="glass-card" style={{ marginTop: "32px", animation: "fadeIn 0.5s ease" }}>
                    <div className="proposal-content">
                        <h2 style={{ marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid var(--glass-border)" }}>Generated Proposal</h2>
                        <div
                            className="markdown-body"
                            dangerouslySetInnerHTML={renderMarkdown(proposal)}
                        />
                    </div>
                </div>
            )}

            <style jsx>{`
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
