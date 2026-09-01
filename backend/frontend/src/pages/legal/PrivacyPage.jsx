import privacyContent from './privacy-policy.md?raw';
import ReactMarkdown from 'react-markdown';

export default function PrivacyPage() {
  const handleDownload = () => {
    const blob = new Blob([privacyContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'privacy-policy.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto px-10 py-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <button
          onClick={handleDownload}
          className="text-xs font-semibold uppercase tracking-widest border border-border-subtle rounded-lg px-4 py-2 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
        >
          Download
        </button>
      </div>

      <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300">
        <ReactMarkdown>{privacyContent}</ReactMarkdown>
      </div>
    </div>
  );
}