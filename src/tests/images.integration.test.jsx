import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { checkImagePaths, checkImages } from '../../scripts/check-images.mjs';
import App from '../App.jsx';
import PetDetailModal from '../components/pets/PetDetailModal.jsx';
import FallbackImage from '../components/ui/FallbackImage.jsx';
import { fallbackImage, imageAssets, imageCredits, petImages } from '../data/images.js';
import pets from '../data/pets.json';

vi.mock('../services/firebaseClient.js', () => ({ isFirebaseConfigured: false, getFirestoreClient: vi.fn(async () => null) }));
vi.mock('../services/emailService.js', () => ({ sendFormEmails: vi.fn(async () => ({ sent: true, acknowledgementSent: true, reason: '' })) }));

const routerFlags = { v7_startTransition: true, v7_relativeSplatPath: true };
const unknown = 'TO BE CONFIRMED';

function renderAt(path) {
  return render(<MemoryRouter future={routerFlags} initialEntries={[path]}><App /></MemoryRouter>);
}

describe('Local photograph wiring and honest credits', () => {
  it('checks all catalogue, pet gallery and literal runtime image references on disk', async () => {
    const result = await checkImages({ projectRoot: process.cwd() });
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.checkedPaths.length).toBeGreaterThan(40);
    imageCredits.forEach((image) => {
      expect(result.checkedPaths).toContain(image.path);
      expect(existsSync(resolve(process.cwd(), 'public', image.path.slice(1)))).toBe(true);
    });
  });

  it('fails for a deliberately missing image without writing a test file', async () => {
    const missing = '/images/pets/deliberately-missing-photo-for-check.webp';
    const result = await checkImages({ projectRoot: process.cwd(), additionalPaths: [missing] });
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes(`missing local image ${missing}`))).toBe(true);
  });

  it('rejects paths outside public/images and checks real image paths with query strings', () => {
    const result = checkImagePaths([
      `${imageAssets.homeHero.path}?version=1#preview`,
      '/images/../../package.json',
      '/images/%2e%2e/%2e%2e/package.json',
    ], { projectRoot: process.cwd() });
    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(2);
    result.errors.forEach((error) => expect(error).toContain('must stay inside public/images'));
  });

  it('records every distinct local photograph once with complete, honest credit fields', () => {
    expect(new Set(imageCredits.map((image) => image.path)).size).toBe(imageCredits.length);
    expect(imageCredits.some((image) => image.path === fallbackImage.path)).toBe(true);
    const usedDescriptors = [...Object.values(imageAssets), ...Object.values(petImages).flatMap(Object.values)];
    usedDescriptors.forEach((image) => expect(imageCredits.some((credit) => credit.path === image.path)).toBe(true));
    imageCredits.forEach((image) => {
      expect(image.path).toMatch(/^\/images\//);
      expect(image.alt.trim().length).toBeGreaterThan(0);
      expect(image.width).toBeGreaterThan(0);
      expect(image.height).toBeGreaterThan(0);
      ['photographer', 'source', 'url', 'licence'].forEach((field) => {
        expect(typeof image.credit[field], `${image.path}: ${field}`).toBe('string');
        expect(image.credit[field].trim().length).toBeGreaterThan(0);
      });
      if (image.credit.url !== unknown) {
        const source = new URL(image.credit.url);
        expect(source.protocol).toBe('https:');
        expect(source.pathname, 'Use the actual photo source, not an invented provider homepage').not.toBe('/');
      }
    });
  });

  it('shows pending credit notices for every unconfirmed photo without invented source links', () => {
    renderAt('/credits');
    const cards = new Map(Array.from(document.querySelectorAll('.credit-card'), (card) => [
      card.querySelector('code')?.textContent, card,
    ]));
    expect(cards.size).toBe(imageCredits.length);
    for (const image of imageCredits) {
      const card = cards.get(image.path);
      expect(card).toBeDefined();
      expect(card.querySelector('img')).toHaveAttribute('src', image.path);
      if (Object.values(image.credit).includes(unknown)) {
        expect(card.querySelector('.credits-pending-note')).toHaveTextContent(/^Credits being confirmed$/);
      }
      if (image.credit.url === unknown) expect(card.querySelector('a[href^="http"]')).toBeNull();
    }
  });

  it('falls back once per failing source, reserves the image slot, and recovers for another source', () => {
    const { rerender } = render(<FallbackImage alt={imageAssets.tileAdopt.alt} height={675} src={imageAssets.tileAdopt.path} width={900} />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('width', '900');
    expect(image).toHaveAttribute('height', '675');
    fireEvent.error(image);
    expect(image).toHaveAttribute('src', fallbackImage.path);
    expect(image).toHaveAttribute('alt', fallbackImage.alt);
    fireEvent.error(image);
    expect(image).toHaveAttribute('src', fallbackImage.path);
    rerender(<FallbackImage alt={imageAssets.tileRelease.alt} height={675} src={imageAssets.tileRelease.path} width={900} />);
    expect(image).toHaveAttribute('src', imageAssets.tileRelease.path);
    expect(image).toHaveAttribute('alt', imageAssets.tileRelease.alt);
    fireEvent.error(image);
    expect(image).toHaveAttribute('src', fallbackImage.path);
  });

  it('loads the Home hero eagerly at high priority while keeping other local images lazy', () => {
    renderAt('/');
    const hero = document.querySelector('.home-hero__photo');
    expect(hero).toHaveAttribute('src', imageAssets.homeHero.path);
    expect(hero).toHaveAttribute('loading', 'eager');
    expect(hero.getAttribute('fetchpriority')).toBe('high');
    document.querySelectorAll('img').forEach((image) => {
      if (image !== hero) expect(image).toHaveAttribute('loading', 'lazy');
      expect(Number(image.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(image.getAttribute('height'))).toBeGreaterThan(0);
    });
  });

  it('uses one genuine local photo per pet without duplicate gallery entries', () => {
    expect(pets).toHaveLength(18);
    pets.forEach((pet) => {
      expect(pet.gallery).toEqual([pet.image]);
      expect(petImages[pet.id].portrait.path).toBe(pet.image);
      expect(petImages[pet.id].lifestyle.path).toBe(pet.image);
      expect(existsSync(resolve(process.cwd(), 'public', pet.image.slice(1)))).toBe(true);
    });
  });

  it('retains two-photo modal navigation when supplied two distinct real image paths', async () => {
    const user = userEvent.setup();
    const firstPhoto = pets[0].image;
    const secondPhoto = pets[1].image;
    expect(secondPhoto).not.toBe(firstPhoto);
    const fixture = { ...pets[0], image: firstPhoto, gallery: [firstPhoto, secondPhoto] };
    render(<MemoryRouter future={routerFlags}><PetDetailModal isFavourite={false} onClose={vi.fn()} onToggleFavourite={vi.fn()} pet={fixture} /></MemoryRouter>);
    const first = screen.getByRole('button', { name: `Show ${fixture.name} photo 1` });
    const second = screen.getByRole('button', { name: `Show ${fixture.name} photo 2` });
    await user.click(second);
    expect(document.querySelector('.pet-detail__main-image')).toHaveAttribute('src', secondPhoto);
    expect(second).toHaveAttribute('aria-pressed', 'true');
    expect(first).toHaveAttribute('aria-pressed', 'false');
    await user.click(first);
    expect(document.querySelector('.pet-detail__main-image')).toHaveAttribute('src', firstPhoto);
  });
});
