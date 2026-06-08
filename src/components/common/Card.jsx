function Card({ className = "", children }) {
  return <section className={`card ${className}`}>{children}</section>;
}

export default Card;
