import { useId, useState } from 'react';

// Render keyboard-friendly disclosure panels, allowing one or several panels to stay open.
export default function Accordion({ items = [], allowMultiple = false, defaultOpenIds = [], label = 'Frequently asked questions' }) {
  const reactId = useId().replaceAll(':', '');
  const [openIds, setOpenIds] = useState(() => new Set(defaultOpenIds.map(String)));

  function toggleItem(id) {
    setOpenIds((current) => {
      const next = allowMultiple ? new Set(current) : new Set();
      if (current.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div aria-label={label} className="accordion" role="group">
      {items.map((item, index) => {
        const itemId = String(item.id ?? index);
        const isOpen = openIds.has(itemId);
        const buttonId = `accordion-${reactId}-button-${index}`;
        const panelId = `accordion-${reactId}-panel-${index}`;

        return (
          <AccordionItem
            key={itemId}
            buttonId={buttonId}
            isOpen={isOpen}
            item={item}
            onToggle={() => toggleItem(itemId)}
            panelId={panelId}
          />
        );
      })}
    </div>
  );
}

// Connect one accordion question to its answer panel with accessible state attributes.
function AccordionItem({ item, buttonId, panelId, isOpen, onToggle }) {
  return (
    <div className={`accordion__item${isOpen ? ' accordion__item--open' : ''}`}>
      <h3 className="accordion__heading">
        <button
          aria-controls={panelId}
          aria-expanded={isOpen}
          className="accordion__trigger"
          id={buttonId}
          onClick={onToggle}
          type="button"
        >
          <span>{item.title}</span>
          <span aria-hidden="true" className="accordion__icon">{isOpen ? '−' : '+'}</span>
        </button>
      </h3>
      <div
        aria-labelledby={buttonId}
        className="accordion__panel"
        hidden={!isOpen}
        id={panelId}
        role="region"
      >
        {item.content}
      </div>
    </div>
  );
}
