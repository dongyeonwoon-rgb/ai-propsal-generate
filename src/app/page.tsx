import ProposalGenerator from "@/components/ProposalGenerator";

export default function Home() {
  return (
    <div className="container">
      <header className="header">
        <h1>AI Proposal Generator</h1>
        <p>Instantly generate professional proposals from any URL.</p>
      </header>

      <main>
        <ProposalGenerator />
      </main>
    </div>
  );
}
