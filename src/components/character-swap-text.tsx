export function CharacterSwapText({ text }: { text: string }) {
  return (
    <span className="character-swap-text">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="character-swap-visual">
        {[...text].map((character, index) =>
          character === " " ? (
            <span key={`${character}-${index}`}> </span>
          ) : (
            <span className="character-swap-letter" key={`${character}-${index}`}>
              <span className="character-swap-primary">{character}</span>
              <span className="character-swap-alternate">{character}</span>
            </span>
          ),
        )}
      </span>
    </span>
  );
}
