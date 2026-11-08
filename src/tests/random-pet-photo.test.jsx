import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RandomPetPhoto from '../components/home/RandomPetPhoto.jsx';
import { petImages } from '../data/images.js';
import HomePage from '../pages/HomePage.jsx';

vi.mock('../services/firebaseClient.js', () => ({ isFirebaseConfigured: false, getFirestoreClient: vi.fn(async () => null) }));

const dogUrl = 'https://images.dog.ceo/breeds/retriever/example.jpg';
const catUrl = 'https://cdn2.thecatapi.com/images/example.jpg';
const response = (data) => ({ ok: true, json: async () => data });

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe('Optional random pet photos', () => {
  it('shows a loading skeleton, a credited dog photo, and a fresh photo after Refresh', async () => {
    const user = userEvent.setup();
    let finishLoading;
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => new Promise((resolve) => { finishLoading = resolve; }))
      .mockResolvedValueOnce(response({ status: 'success', message: `${dogUrl}?second` }));
    vi.stubGlobal('fetch', fetchMock);
    render(<RandomPetPhoto />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading a random dog photo');
    expect(document.querySelector('.skeleton')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh dog photo' })).toBeDisabled();
    await act(async () => { finishLoading(response({ status: 'success', message: dogUrl })); });

    const image = screen.getByRole('img', { name: 'Random dog photograph provided by Dog CEO API' });
    expect(image).toHaveAttribute('src', dogUrl);
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('width', '1200');
    expect(image).toHaveAttribute('height', '900');
    expect(screen.getByRole('link', { name: 'Dog CEO API' })).toHaveAttribute('href', 'https://dog.ceo/dog-api/');
    expect(fetchMock).toHaveBeenCalledWith('https://dog.ceo/api/breeds/image/random', expect.objectContaining({ signal: expect.any(AbortSignal), cache: 'no-store' }));
    expect(fetchMock.mock.calls[0][1]).not.toHaveProperty('headers');

    await user.click(screen.getByRole('button', { name: 'Refresh dog photo' }));
    await waitFor(() => expect(screen.getByRole('img')).toHaveAttribute('src', `${dogUrl}?second`));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('requests a cat with the Vite API key header and credits TheCatAPI', async () => {
    vi.stubEnv('VITE_CAT_API_KEY', 'test-browser-key');
    const fetchMock = vi.fn().mockResolvedValue(response([{ url: catUrl }]));
    vi.stubGlobal('fetch', fetchMock);
    render(<RandomPetPhoto species="cat" />);

    expect(await screen.findByRole('img', { name: 'Random cat photograph provided by TheCatAPI' })).toHaveAttribute('src', catUrl);
    expect(fetchMock).toHaveBeenCalledWith('https://api.thecatapi.com/v1/images/search?limit=1', expect.objectContaining({ headers: { 'x-api-key': 'test-browser-key' } }));
    expect(screen.getByRole('link', { name: 'TheCatAPI' })).toHaveAttribute('href', 'https://thecatapi.com/');
  });

  it('falls back locally on network failure and recovers after Refresh', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce(response([{ url: catUrl }])));
    render(<RandomPetPhoto species="cat" />);

    expect(await screen.findByRole('img')).toHaveAttribute('src', petImages.miso.portrait.path);
    expect(screen.getByRole('status')).toHaveTextContent('local photo');
    expect(screen.getByRole('link', { name: /credit/i })).toHaveAttribute('href', '/credits');
    await user.click(screen.getByRole('button', { name: 'Refresh cat photo' }));
    await waitFor(() => expect(screen.getByRole('img')).toHaveAttribute('src', catUrl));
    expect(screen.queryByText(/local photo/)).not.toBeInTheDocument();
  });

  it.each([
    ['HTTP failure', { ok: false }],
    ['invalid data', response({ status: 'success', message: null })],
    ['unsafe image URL', response({ status: 'success', message: 'http://example.com/dog.jpg' })],
  ])('uses the local dog fallback after %s', async (_label, result) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(result));
    render(<RandomPetPhoto />);
    expect(await screen.findByRole('img')).toHaveAttribute('src', petImages.milo.portrait.path);
    expect(screen.getByRole('button', { name: 'Refresh dog photo' })).toBeEnabled();
  });

  it('uses the local fallback when a remote image cannot load', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ status: 'success', message: dogUrl })));
    render(<RandomPetPhoto />);
    fireEvent.error(await screen.findByRole('img'));
    expect(screen.getByRole('img')).toHaveAttribute('src', petImages.milo.portrait.path);
    expect(screen.getByRole('status')).toHaveTextContent('couldn’t load a dog photo');
  });

  it('ends a stalled request with a local fallback', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(() => new Promise(() => {}));
    vi.stubGlobal('fetch', fetchMock);
    render(<RandomPetPhoto />);
    await act(async () => { await vi.advanceTimersByTimeAsync(10000); });
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
    expect(screen.getByRole('img')).toHaveAttribute('src', petImages.milo.portrait.path);
  });

  it('aborts on unmount and ignores a late response', async () => {
    let finishLoading;
    const fetchMock = vi.fn(() => new Promise((resolve) => { finishLoading = resolve; }));
    vi.stubGlobal('fetch', fetchMock);
    const { unmount } = render(<RandomPetPhoto />);
    unmount();
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
    await act(async () => { finishLoading(response({ status: 'success', message: dogUrl })); });
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('adds both random friends on Home while keeping its other images local', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => response(url.includes('dog.ceo') ? { status: 'success', message: dogUrl } : [{ url: catUrl }])));
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><HomePage /></MemoryRouter>);
    const strip = screen.getByRole('region', { name: 'Say hello to a random friend' });
    await waitFor(() => expect(within(strip).getAllByRole('img')).toHaveLength(2));
    expect(within(strip).getAllByRole('button', { name: /Refresh (dog|cat) photo/ })).toHaveLength(2);
    document.querySelectorAll('img').forEach((image) => {
      if (!strip.contains(image)) expect(image.getAttribute('src')).toMatch(/^\/images\//);
    });
  });

  it('automatically changes photos every 20 seconds without hiding the current photo', async () => {
    vi.useFakeTimers();
    let finishRefresh;
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ status: 'success', message: dogUrl }))
      .mockImplementationOnce(() => new Promise((resolve) => { finishRefresh = resolve; }))
      .mockResolvedValue(response({ status: 'success', message: `${dogUrl}?third` }));
    vi.stubGlobal('fetch', fetchMock);
    render(<RandomPetPhoto />);
    await act(async () => {});
    await act(async () => { await vi.advanceTimersByTimeAsync(19999); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(1); });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('img')).toHaveAttribute('src', dogUrl);
    expect(document.querySelector('.skeleton')).not.toBeInTheDocument();
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await act(async () => { finishRefresh(response({ status: 'success', message: `${dogUrl}?second` })); });
    expect(screen.getByRole('img')).toHaveAttribute('src', `${dogUrl}?second`);
    await act(async () => { await vi.advanceTimersByTimeAsync(20000); });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(screen.getByRole('img')).toHaveAttribute('src', `${dogUrl}?third`);
  });

  it('supports Pause, manual Refresh while paused, and Resume', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue(response({ status: 'success', message: dogUrl }));
    vi.stubGlobal('fetch', fetchMock);
    render(<RandomPetPhoto />);
    await act(async () => {});
    fireEvent.click(screen.getByRole('button', { name: 'Pause dog slideshow' }));
    await act(async () => { await vi.advanceTimersByTimeAsync(60000); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Refresh dog photo' }));
    await act(async () => {});
    expect(fetchMock).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole('button', { name: 'Resume dog slideshow' }));
    await act(async () => { await vi.advanceTimersByTimeAsync(20000); });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('suspends automatic updates while hovered or focused', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue(response({ status: 'success', message: dogUrl }));
    vi.stubGlobal('fetch', fetchMock);
    render(<RandomPetPhoto />);
    await act(async () => {});
    const card = screen.getByRole('article');
    fireEvent.mouseEnter(card);
    await act(async () => { await vi.advanceTimersByTimeAsync(40000); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fireEvent.mouseLeave(card);
    fireEvent.focus(screen.getByRole('button', { name: 'Refresh dog photo' }));
    await act(async () => { await vi.advanceTimersByTimeAsync(40000); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fireEvent.blur(screen.getByRole('button', { name: 'Refresh dog photo' }), { relatedTarget: document.body });
    await act(async () => { await vi.advanceTimersByTimeAsync(20000); });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('pauses automatic updates while the browser tab is hidden', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue(response({ status: 'success', message: dogUrl }));
    vi.stubGlobal('fetch', fetchMock);
    const hidden = vi.spyOn(document, 'hidden', 'get');
    hidden.mockReturnValue(false);
    const { unmount } = render(<RandomPetPhoto />);
    try {
      await act(async () => {});
      hidden.mockReturnValue(true);
      fireEvent(document, new Event('visibilitychange'));
      await act(async () => { await vi.advanceTimersByTimeAsync(60000); });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      hidden.mockReturnValue(false);
      fireEvent(document, new Event('visibilitychange'));
      await act(async () => { await vi.advanceTimersByTimeAsync(20000); });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    } finally {
      unmount();
      hidden.mockRestore();
    }
  });

  it('starts paused for reduced motion and allows an explicit Resume', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue(response({ status: 'success', message: dogUrl }));
    vi.stubGlobal('fetch', fetchMock);
    const preference = { matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() };
    vi.stubGlobal('matchMedia', vi.fn(() => preference));
    render(<RandomPetPhoto />);
    await act(async () => {});
    await act(async () => { await vi.advanceTimersByTimeAsync(60000); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Resume dog slideshow' }));
    await act(async () => { await vi.advanceTimersByTimeAsync(20000); });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('cancels automatic updates after unmount', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue(response({ status: 'success', message: dogUrl }));
    vi.stubGlobal('fetch', fetchMock);
    const { unmount } = render(<RandomPetPhoto />);
    await act(async () => {});
    unmount();
    await act(async () => { await vi.advanceTimersByTimeAsync(60000); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('expands Home to four friends and can collapse it again', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn(async (url) => response(url.includes('dog.ceo') ? { status: 'success', message: dogUrl } : [{ url: catUrl }])));
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><HomePage /></MemoryRouter>);
    const strip = screen.getByRole('region', { name: 'Say hello to a random friend' });
    await user.click(within(strip).getByRole('button', { name: 'Show more friends' }));
    await waitFor(() => expect(within(strip).getAllByRole('img')).toHaveLength(4));
    expect(within(strip).getAllByRole('link', { name: 'Dog CEO API' })).toHaveLength(2);
    expect(within(strip).getAllByRole('link', { name: 'TheCatAPI' })).toHaveLength(2);
    const collapse = within(strip).getByRole('button', { name: 'Show fewer friends' });
    expect(collapse).toHaveAttribute('aria-expanded', 'true');
    await user.click(collapse);
    expect(within(strip).getAllByRole('img')).toHaveLength(2);
    expect(within(strip).getByRole('button', { name: 'Show more friends' })).toHaveAttribute('aria-expanded', 'false');
  });
});
