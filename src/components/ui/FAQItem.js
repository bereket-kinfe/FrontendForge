export default function FAQItem({ question, answer, open = false }) {
  return <details className="faq-item" open={open}><summary>{question}<span aria-hidden="true">＋</span></summary><p>{answer}</p></details>;
}