/* Nekyia — content. Everything the reader reads lives here, as data, so it
   can be checked against Jung's texts without wading through drawing code.

   Rules this file keeps:
   - Every concept names the work(s) where Jung develops it (CW = Collected Works).
   - Quotes appear only where the wording and source are certain. Where they
     are not, there is no quote rather than a guessed one.
   - Popularised or altered versions are named as such. */

window.N = window.N || {};

N.layers = [
  { id: 'surface',    name: 'Consciousness',            from: 0.000, to: 0.225 },
  { id: 'threshold',  name: 'The threshold',            from: 0.225, to: 0.255 },
  { id: 'personal',   name: 'The personal unconscious', from: 0.255, to: 0.505 },
  { id: 'boundary',   name: 'Where the personal ends',  from: 0.505, to: 0.545 },
  { id: 'collective', name: 'The collective unconscious', from: 0.545, to: 0.880 },
  { id: 'core',       name: 'The Self',                 from: 0.880, to: 1.001 },
];

/* d = depth on the map (0 surface, 1 core); x = horizontal position (0..1). */
N.concepts = [
  // ───────────────────────── Surface ─────────────────────────
  {
    id: 'ego', layer: 'surface', d: 0.075, x: 0.30, glyph: 'lamp',
    title: 'The Ego',
    short: 'The centre of consciousness, and only of consciousness.',
    instructions: 'Move the lamp. Only what falls inside it is conscious. Watch what keeps moving in the dark.',
    body: [
      'For Jung the ego is the complex that makes up the centre of the field of consciousness. It gives us continuity and the sense of "I": this is my memory, my intention, my body. It is real and necessary, and it is small.',
      'The field of consciousness can hold only a few contents at once. Everything else carries on outside it: memories, feelings, perceptions too faint to notice, and material that has never been conscious at all. The ego is therefore not the centre of the whole psyche. That place, in Jung\'s scheme, belongs to the Self, which the ego experiences as something larger than itself.',
    ],
    sources: [
      'Aion (1951), CW 9ii, ch. 1 "The Ego"',
      '"On the Nature of the Psyche" (1947/1954), CW 8',
    ],
    popular: null,
    quote: null,
    question: 'What is in your lamp right now, and what do you suspect is moving just outside it?',
  },
  {
    id: 'persona', layer: 'surface', d: 0.125, x: 0.70, glyph: 'mask',
    title: 'The Persona',
    short: 'The face we turn toward the world.',
    instructions: 'Choose a situation to put on its mask. Wear it a while, then take it off and look at the face beneath.',
    body: [
      'The persona is the name Jung borrowed from the mask worn by actors in antiquity. It is the adapted self we present in a role: the professional manner, the family self, the way we are with strangers. It is a compromise between the individual and what society expects, and Jung treats it as necessary rather than false.',
      'The danger he describes is identification. When someone becomes the role, and the doctor is only ever the doctor, the rest of the personality is pushed into the unconscious, where it returns as moods, symptoms or the sudden collapse of the mask. Part of individuation is learning to wear a persona without mistaking it for oneself.',
    ],
    sources: [
      'Two Essays on Analytical Psychology, CW 7, "The Relations between the Ego and the Unconscious" (1928), Part I, ch. 3 "The Persona as a Segment of the Collective Psyche"',
    ],
    popular: null,
    quote: {
      text: 'The persona is a complicated system of relations between individual consciousness and society, fittingly enough a kind of mask, designed on the one hand to make a definite impression upon others, and, on the other, to conceal the true nature of the individual.',
      source: 'Two Essays on Analytical Psychology, CW 7, para. 305',
    },
    question: 'Which of your masks would be hardest to take off, and who would you be without it for an afternoon?',
  },
  {
    id: 'types', layer: 'surface', d: 0.180, x: 0.42, glyph: 'cross',
    title: 'Psychological Types',
    short: 'Two attitudes and four functions of consciousness.',
    instructions: 'Choose a dominant function and its attitude. Then choose an auxiliary. Watch where the inferior function goes.',
    body: [
      'Jung\'s typology describes how consciousness habitually orients itself. There are two attitudes: extraversion, where interest flows toward the object, and introversion, where it flows toward the subject. There are four functions. Thinking and feeling are rational, or judging, functions. Sensation and intuition are irrational, or perceiving, ones. Thinking and feeling exclude each other, as do sensation and intuition.',
      'In a given person one function is usually most differentiated: the dominant, or superior. An auxiliary from the other axis supports it. The function opposite the dominant stays least developed. Jung calls it the inferior function, and it remains close to the unconscious, which is why it shows up as touchiness, clumsiness and sudden, archaic intensity. Jung meant the types as a tool for understanding differences, and warned against using them to pigeonhole people.',
    ],
    sources: [
      'Psychological Types (1921), CW 6, esp. ch. X "General Description of the Types"',
    ],
    popular: 'The Myers-Briggs Type Indicator (MBTI) is a later derivation by Katharine Briggs and Isabel Briggs Myers, not Jung\'s typology. It adds a judging/perceiving scale, turns the functions into a sixteen-type sorting test, and fixes rules Jung left open, such as the auxiliary always taking the opposite attitude to the dominant.',
    quote: null,
    question: 'What is your inferior function, the one that trips you up? What might it know that your strongest one does not?',
  },
  {
    id: 'compensation', layer: 'threshold', d: 0.238, x: 0.64, glyph: 'balance',
    title: 'Compensation',
    short: 'The unconscious answers a one-sided conscious attitude.',
    instructions: 'Choose an attitude and lean into it. Watch what the unconscious sends back, and what happens if you push too far.',
    body: [
      'Jung understood the psyche as a self-regulating system. When the conscious attitude becomes one-sided, the unconscious produces contents that balance it: dreams, fantasies, moods and slips that carry what consciousness is leaving out. Compensation is his name for this, and it is one of the main keys he uses to read dreams.',
      'The more rigid the conscious attitude, the more insistent the compensating material becomes. If it is ignored long enough, the opposite may break through and take over, a reversal Jung called enantiodromia, taking the word from Heraclitus: the confirmed rationalist swept away by a superstition, the relentlessly agreeable person who suddenly explodes.',
    ],
    sources: [
      '"General Aspects of Dream Psychology" (1916/1948), CW 8',
      'Psychological Types, CW 6, "Definitions": Compensation; Enantiodromia',
    ],
    popular: null,
    quote: {
      text: 'The general function of dreams is to try to restore our psychological balance by producing dream material that re-establishes, in a subtle way, the total psychic equilibrium.',
      source: 'Man and His Symbols (1964), "Approaching the Unconscious"',
    },
    question: 'Where in your life are you leaning hardest in one direction? What keeps knocking at the other side?',
  },

  // ─────────────────────── Personal unconscious ───────────────────────
  {
    id: 'shadow', layer: 'personal', d: 0.300, x: 0.32, glyph: 'shadow',
    title: 'The Shadow',
    short: 'What we are, and would rather not be.',
    instructions: 'Move and your shadow follows, not quite in step. Then choose a trait to disown and watch where it lands.',
    body: [
      'The shadow is the part of the personality the ego does not recognise as its own: the inferior, unadapted and often morally uncomfortable qualities, and also good qualities that never found a place in the conscious self. It is usually encountered first in the personal unconscious, and for Jung it is the first stage of any real work on oneself.',
      'Because it is unconscious, the shadow is mostly met in projection. We see it in other people, where it provokes a reaction out of proportion to the facts. Withdrawing a projection means recognising that the quality we can hardly bear in someone else also lives in us. Jung is clear that this is a moral effort as much as an intellectual one.',
    ],
    sources: [
      'Aion (1951), CW 9ii, ch. 2 "The Shadow"',
      '"Psychology and Religion" (1938), CW 11',
      'Two Essays on Analytical Psychology, CW 7',
    ],
    popular: 'Recent "shadow work" writing often treats the shadow as a set of wounds or blocked positive traits to unlock. Jung\'s shadow includes real destructiveness, and he saw facing it as sobering rather than empowering.',
    quote: {
      text: 'Everyone carries a shadow, and the less it is embodied in the individual\'s conscious life, the blacker and denser it is.',
      source: '"Psychology and Religion", CW 11, para. 131',
    },
    question: 'Who irritates you more than they reasonably should? What would it mean if the quality you dislike were also yours?',
  },
  {
    id: 'complexes', layer: 'personal', d: 0.370, x: 0.68, glyph: 'cluster',
    title: 'Complexes',
    short: 'Feeling-toned knots that act with a will of their own.',
    instructions: 'A short word-association test in the style of Jung\'s experiments. Answer each word with the first word that comes. Your answers stay on this page and are forgotten when you close it.',
    body: [
      'Jung\'s first scientific reputation came from the word-association experiment at the Burghölzli clinic. A subject answers a list of stimulus words as fast as possible while the reaction time is measured. Jung noticed that certain words produced disturbances: long delays, repeating the stimulus word, odd or missing answers, forgetting the answer later. These "complex indicators" clustered around emotionally charged themes.',
      'He called such a cluster a feeling-toned complex: a group of associations held together by a shared emotion, with a core often going back to an experience of conflict or shock. Complexes behave like splinter personalities. They have their own energy, can interrupt the ego\'s intentions and can, in Jung\'s phrase, have us rather than the other way round. Everyone has them. They are not in themselves pathological.',
    ],
    sources: [
      'Studies in Word Association (1904–1910), CW 2',
      '"A Review of the Complex Theory" (1934), CW 8',
    ],
    popular: 'Talk of having an "inferiority complex" comes from Alfred Adler, not Jung, though the general word "complex" was Jung\'s contribution to psychology.',
    quote: {
      text: 'Everyone knows nowadays that people "have complexes." What is not so well known, though far more important theoretically, is that complexes can have us.',
      source: '"A Review of the Complex Theory" (1934), CW 8',
    },
    question: 'Is there a subject that makes you lose your footing, where you hear yourself react before you have decided to? What might sit at its centre?',
  },
  {
    id: 'dreams', layer: 'personal', d: 0.440, x: 0.38, glyph: 'moon',
    title: 'Dreams',
    short: 'A spontaneous self-portrait of the psyche\'s situation.',
    instructions: 'Walk through a dream Jung recorded himself, in its four acts. Then touch a symbol to set a personal association beside its amplification.',
    body: [
      'Jung disagreed with Freud that dreams disguise a hidden wish. He read the dream as a natural product that shows the actual state of the psyche in symbolic form, often compensating the conscious attitude. He asked what a dream is for as well as what caused it.',
      'He noticed that many dreams have the shape of a drama: an exposition of place and persons, a development, a culmination where something decisive happens, and a lysis, the result or resolution. His method pairs the dreamer\'s own associations with amplification: gathering parallels from myth, religion and folklore to widen the meaning of an image rather than reduce it to one cause.',
    ],
    sources: [
      '"On the Nature of Dreams" (1945/1948), CW 8',
      '"General Aspects of Dream Psychology", CW 8',
      'Memories, Dreams, Reflections, ch. "Sigmund Freud" (the house dream)',
    ],
    popular: 'Dream dictionaries that assign each symbol a fixed meaning are the opposite of Jung\'s method. He insisted a symbol could only be understood in the context of the dreamer\'s life and associations.',
    quote: {
      text: 'The dream is a little hidden door in the innermost and most secret recesses of the soul, opening into that cosmic night which was psyche long before there was any ego-consciousness.',
      source: '"The Meaning of Psychology for Modern Man" (1933), CW 10, para. 304',
    },
    question: 'Which dream of yours has stayed with you longest? If it were a picture of your situation at that time, what would it be showing?',
  },
  {
    id: 'active', layer: 'boundary', d: 0.525, x: 0.60, glyph: 'wisp',
    title: 'Active Imagination',
    short: 'Meeting the images of the unconscious while awake.',
    instructions: 'Choose an image. You can try to steer it, or you can watch it. Notice which one brings it to life.',
    body: [
      'Active imagination is the method Jung developed during his own confrontation with the unconscious from 1913, the period recorded in the Red Book. One lets an image or mood arise and then attends to it with full attention, allowing it to move and speak on its own, while the ego takes part as itself: questioning, answering, drawing or writing it down.',
      'It differs from daydreaming, where nothing is at stake, and from guided visualisation, where the ego writes the script. The meeting of conscious and unconscious produces what Jung called the transcendent function: a third position that neither side could reach alone. He also warned that the method is not harmless and is not suitable for everyone, particularly where the ego is fragile.',
    ],
    sources: [
      '"The Transcendent Function" (written 1916, published 1958), CW 8',
      'Memories, Dreams, Reflections, ch. "Confrontation with the Unconscious"',
      'The Red Book: Liber Novus (ed. Sonu Shamdasani, 2009)',
    ],
    popular: null,
    quote: {
      text: 'Who looks outside, dreams; who looks inside, awakes.',
      source: 'Letter to Fanny Bowditch, 22 October 1916, C. G. Jung: Letters, vol. 1',
    },
    question: 'Is there an image, from a dream or a mood, that you could sit with for ten minutes and simply watch?',
  },

  // ─────────────────────── Collective unconscious ───────────────────────
  {
    id: 'collective', layer: 'collective', d: 0.580, x: 0.34, glyph: 'islands',
    title: 'The Collective Unconscious',
    short: 'The deep layer we do not acquire, but inherit.',
    instructions: 'Lower the water. Watch the separate islands turn out to stand on one floor.',
    body: [
      'Below the personal unconscious Jung placed a deeper layer that does not come from personal experience. He called it the collective unconscious: a structural inheritance, the same in principle for all human beings, consisting of predispositions to experience and imagine in typical ways. Its contents are the archetypes.',
      'His evidence was the recurrence of the same motifs in the dreams and fantasies of patients who had no way of knowing their historical parallels, and in myths across cultures with no contact. He was careful to say that what is inherited is a possibility of representation, a form, and not a particular image or memory.',
    ],
    sources: [
      '"The Concept of the Collective Unconscious" (1936), CW 9i',
      '"Archetypes of the Collective Unconscious" (1934/1954), CW 9i',
    ],
    popular: 'It is often described as a kind of shared memory or telepathic network. Jung did not claim inherited memories or content, only inherited forms. He called the idea of inherited images a misunderstanding.',
    quote: {
      text: 'The collective unconscious is a part of the psyche which can be negatively distinguished from a personal unconscious by the fact that it does not, like the latter, owe its existence to personal experience and consequently is not a personal acquisition.',
      source: '"The Concept of the Collective Unconscious", CW 9i, para. 88',
    },
    question: 'Which story, from any tradition, moves you in a way you cannot quite explain from your own life?',
  },
  {
    id: 'archetypes', layer: 'collective', d: 0.625, x: 0.68, glyph: 'gather',
    title: 'Archetypes',
    short: 'Patterns, not pictures.',
    instructions: 'Watch the particles find a pattern. Then let different traditions fill it in. Finally, ask for the archetype as such.',
    body: [
      'An archetype is a typical form of experience and imagination: the mother, the child, the hero, rebirth, the journey below. Jung compared it to the axial system of a crystal, which gives a structure before any matter fills it. The archetype itself is empty of content and cannot be seen directly.',
      'What we meet are archetypal images: the particular Madonna, Isis or Guanyin through which the pattern shows itself in a given culture and a given person. From 1946 Jung distinguished carefully between the archetype as such, which is irrepresentable, and these images. The same pattern takes on the colour of each consciousness it enters.',
    ],
    sources: [
      '"Archetypes of the Collective Unconscious" (1934/1954), CW 9i',
      '"On the Nature of the Psyche" (1947/1954), CW 8',
    ],
    popular: 'Popular lists of "twelve archetypes" used in branding and personality quizzes come from later marketing writers, not from Jung. He never fixed their number.',
    quote: {
      text: 'The archetype is essentially an unconscious content that is altered by becoming conscious and by being perceived, and it takes its colour from the individual consciousness in which it happens to appear.',
      source: '"Archetypes of the Collective Unconscious", CW 9i, para. 6',
    },
    question: 'Which figure keeps returning in the stories you love? What might it be carrying for you?',
  },
  {
    id: 'anima', layer: 'collective', d: 0.668, x: 0.30, glyph: 'reflection',
    title: 'Anima and Animus',
    short: 'The contrasexual figure, the bridge to the depths.',
    instructions: 'Look into the water. Choose anima or animus and move through its stages. Then see what happens when it is projected.',
    body: [
      'Jung described the anima as the feminine image in a man\'s psyche and the animus as the masculine image in a woman\'s. Each personifies the unconscious in its contrasexual form and stands between the ego and the deeper layers, as a guide or as a source of possession. They appear in dreams and fantasies and, above all, in projection: the powerful fascination of falling in love, or of fierce, borrowed opinions.',
      'Jung set out four stages of the anima, from the purely instinctual to wisdom. The corresponding stages of the animus were set out later by Marie-Louise von Franz. His gendered framing has been heavily criticised. Many post-Jungians now read anima and animus as a contrasexual or simply "other" figure present in anyone, not tied to biological sex.',
    ],
    sources: [
      'Aion, CW 9ii, ch. 3 "The Syzygy: Anima and Animus"',
      'Two Essays on Analytical Psychology, CW 7',
      '"The Psychology of the Transference" (1946), CW 16 (the four stages of the anima)',
      'M.-L. von Franz, "The Process of Individuation", in Man and His Symbols (stages of the animus)',
    ],
    popular: 'The four stages of the animus often attributed to Jung come from von Franz. Critiques by later analysts, including James Hillman and feminist writers, reject the fixed link to gender.',
    quote: {
      text: 'Every man carries within him the eternal image of woman, not the image of this or that particular woman, but a definite feminine image.',
      source: '"Marriage as a Psychological Relationship" (1925), CW 17, para. 338',
    },
    question: 'Who has fascinated you beyond reason? What part of you might you have met in them?',
  },
  {
    id: 'mother', layer: 'collective', d: 0.712, x: 0.66, glyph: 'shells',
    title: 'The Great Mother',
    short: 'The one who holds, and the one who holds on.',
    instructions: 'Move between the two faces of the archetype. Watch what happens to the small lights it holds.',
    body: [
      'The mother archetype appears as the personal mother and grandmother, as goddesses, the Church, the earth, the sea, the city, a cave or a vessel. Jung lists its qualities on two sides: care, nourishment, growth, fertility and wisdom beyond reason on one, and on the other what is secret, dark, devouring and inescapable, the abyss and the world of the dead.',
      'He called these the loving and the terrible mother. A person\'s relationship to the archetype is shaped by, but not identical with, their relationship to their actual mother. Much of what gets blamed on real mothers, Jung argued, belongs to the archetype projected onto them.',
    ],
    sources: [
      '"Psychological Aspects of the Mother Archetype" (1938/1954), CW 9i',
      'Symbols of Transformation (1912/1952), CW 5',
    ],
    popular: 'Erich Neumann\'s The Great Mother (1955) developed the idea much further and is the source of many of the images now associated with it.',
    quote: null,
    question: 'Where in your life are you being held, and where held on to? Can you tell them apart?',
  },
  {
    id: 'wise', layer: 'collective', d: 0.748, x: 0.36, glyph: 'star',
    title: 'The Wise Old Man',
    short: 'The spirit that arrives when will runs out.',
    instructions: 'A traveller is lost. Try the usual ways out. See who comes, and when.',
    body: [
      'In fairytales, Jung observed, the old man appears when the hero is in a hopeless situation from which only deep reflection or a lucky idea can free him. He asks the right question, gives the right advice or the magical help. Jung read him as a personification of spirit: meaning, insight and intuitive knowledge that the conscious personality cannot produce on demand.',
      'Jung met such a figure himself. During his confrontation with the unconscious, a winged old man he called Philemon appeared in his fantasies and taught him that thoughts have an objective life of their own. Philemon recurs throughout the Red Book.',
    ],
    sources: [
      '"The Phenomenology of the Spirit in Fairytales" (1945/1948), CW 9i',
      'Memories, Dreams, Reflections, ch. "Confrontation with the Unconscious" (Philemon)',
    ],
    popular: null,
    quote: null,
    question: 'When were you last truly stuck? What, or who, arrived only after you stopped forcing it?',
  },
  {
    id: 'trickster', layer: 'collective', d: 0.778, x: 0.70, glyph: 'zigzag',
    title: 'The Trickster',
    short: 'The disorderly one who is also a healer.',
    instructions: 'Something in this room is not behaving. You can always leave with Esc.',
    body: [
      'The trickster is the shape-shifting, boundary-crossing figure found in Hermes and Loki, in Coyote and Raven, in the medieval fool and the carnival. Jung wrote about him in a commentary to Paul Radin\'s study of the trickster cycle of the Winnebago people. He described the trickster as a collective shadow figure: an echo of an earlier, undifferentiated consciousness that is both subhuman and superhuman, foolish and divine.',
      'The trickster turns up where things go wrong: slips, pratfalls, accidents at the worst possible moment. Jung also noted his close link to the saviour and the healer. By upsetting order he exposes its rigidity, and the upset carries the seed of renewal.',
    ],
    sources: [
      '"On the Psychology of the Trickster-Figure" (1954), CW 9i; also in Paul Radin, The Trickster (1956)',
    ],
    popular: null,
    quote: null,
    question: 'When did an accident or a disaster in your plans turn out to be what you needed?',
  },
  {
    id: 'hero', layer: 'collective', d: 0.808, x: 0.32, glyph: 'arc',
    title: 'The Hero',
    short: 'The one who goes down into the dark and comes back.',
    instructions: 'Carry the sun along its path. Follow it below the horizon.',
    body: [
      'In Symbols of Transformation, the book that marked his break with Freud, Jung read the hero as a symbol of libido, psychic energy, striving to renew itself. The hero\'s central deed is to free himself from the regressive pull of the mother, often in a descent: swallowed by a monster, the night sea journey of the sun, a passage through the underworld and a rebirth.',
      'For Jung the hero myth is a picture of what consciousness must do again and again: leave the safety of the known, go down into the unconscious and return with something new. The descent you are making on this map is one version of it.',
    ],
    sources: [
      'Symbols of Transformation (1912/1952), CW 5, Part II',
    ],
    popular: 'Joseph Campbell\'s "hero\'s journey" or monomyth in The Hero with a Thousand Faces (1949) drew on Jung among others, but it is Campbell\'s structure, not Jung\'s.',
    quote: null,
    question: 'What descent have you already made in your life? What did you bring back up?',
  },
  {
    id: 'child', layer: 'collective', d: 0.835, x: 0.64, glyph: 'seed',
    title: 'The Child',
    short: 'Abandoned, invincible, and full of future.',
    instructions: 'A small light has been left alone among the winds. Try to protect it, then try not to.',
    body: [
      'The child archetype appears in myths of the divine child and the child hero: abandoned, exposed, persecuted, and yet surviving against all odds. Jung emphasised three features. Abandonment: the child is set apart, isolated from its origins. Invincibility: it is weak and threatened, and cannot be destroyed. Futurity: it anticipates what is to come, the potential wholeness of the personality.',
      'He was careful to separate the archetype from nostalgia about one\'s own childhood. The child is the new thing in the psyche, the possibility of a union of opposites that has not yet happened. That is why it so often appears at turning points.',
    ],
    sources: [
      '"The Psychology of the Child Archetype" (1940), CW 9i; first published with Karl Kerényi in Essays on a Science of Mythology',
    ],
    popular: 'Popular "inner child" therapy, which focuses on healing childhood wounds, grew up later and separately. Jung\'s child archetype is about the future more than the past.',
    quote: null,
    question: 'What in you is still small and new, and seems to survive no matter what?',
  },
  {
    id: 'inflation', layer: 'collective', d: 0.862, x: 0.46, glyph: 'swell',
    title: 'Inflation',
    short: 'When the ego mistakes itself for what it met below.',
    instructions: 'Take on the powers of the figures you have met. Watch the lamp.',
    body: [
      'Contact with the archetypes is powerful, and the ego can be swept up in it. Jung called this inflation: the ego identifies with an archetypal content, the mana of the hero, the healer, the wise one, the great mother, and swells beyond its human size. It can show as grandiosity or as crushing guilt, both being a failure to stay a limited person.',
      'He described a particular danger after the anima or animus has been faced: the mana-personality, where the ego claims the prestige of the powers it has met. The remedy is to distinguish between oneself and the archetypal content, and to return to ordinary human scale.',
    ],
    sources: [
      'Two Essays on Analytical Psychology, CW 7, "The Mana-Personality" and "Negative Inflation"',
      'Psychology and Alchemy (1944), CW 12',
    ],
    popular: null,
    quote: null,
    question: 'When have you felt larger than yourself, or much smaller? What were you identified with at the time?',
  },
  {
    id: 'synchronicity', layer: 'collective', d: 0.893, x: 0.66, glyph: 'waves',
    title: 'Synchronicity',
    short: 'Meaningful coincidence without a cause.',
    instructions: 'Two streams run independently, one inner, one outer. Press Notice when they seem to match. Then look at the count.',
    body: [
      'Synchronicity is Jung\'s term for a meaningful coincidence between an inner state and an outer event that have no causal connection. His best-known example: a patient was telling him a dream of a golden scarab when a scarab-like beetle knocked against the window. He caught it and handed it to her, and the moment broke through her rigidly rational attitude.',
      'He developed the idea with the physicist Wolfgang Pauli and proposed an "acausal connecting principle" operating through meaning. It is the most contested of his ideas. Critics point out that striking coincidences are expected by chance and that we remember matches and forget misses. The demonstration shows both sides.',
    ],
    sources: [
      '"Synchronicity: An Acausal Connecting Principle" (1952), CW 8; first published with Pauli in The Interpretation of Nature and the Psyche',
    ],
    popular: 'The word is now often used to mean "the universe sending a sign". Jung made no promise that such events carry messages, and treated them as rare and tied to intense psychic states.',
    quote: null,
    question: 'Has a coincidence ever mattered to you? What was happening in you at the time?',
  },

  // ─────────────────────── Core ───────────────────────
  {
    id: 'self', layer: 'core', d: 0.955, x: 0.50, glyph: 'mandala',
    title: 'The Self',
    short: 'The centre and the whole circumference.',
    instructions: 'The mandala is made from what you gathered on the way down. Turn it. Touch a petal to remember where it came from.',
    body: [
      'For Jung the Self is both the centre and the totality of the psyche, conscious and unconscious together. The ego is its small, conscious representative. The Self cannot be known directly, only in symbols: the mandala, the quaternity, the precious stone, the divine child, the figure of Christ or the Buddha. Jung called it an image of God in the psyche, meaning a psychological fact rather than a theological claim.',
      'Jung began drawing mandalas daily from 1916 and found they reflected his inner state from day to day. Over time he came to see that everything moved toward the centre. He concluded that the goal of psychic development is the Self, approached by circumambulation rather than a straight line.',
    ],
    sources: [
      'Aion, CW 9ii, ch. 4 "The Self"',
      '"Concerning Mandala Symbolism" (1950), CW 9i',
      'Psychology and Alchemy (1944), CW 12',
      'Memories, Dreams, Reflections, ch. "Confrontation with the Unconscious"',
    ],
    popular: null,
    quote: {
      text: 'The self is not only the centre, but also the whole circumference which embraces both conscious and unconscious; it is the centre of this totality, just as the ego is the centre of consciousness.',
      source: 'Psychology and Alchemy, CW 12, para. 44',
    },
    question: 'If your life so far were a mandala, what would sit at its centre?',
  },
  {
    id: 'individuation', layer: 'core', d: 0.995, x: 0.50, glyph: 'spiral',
    title: 'Individuation',
    short: 'Becoming the person you are.',
    instructions: 'This is the path you have walked. Begin the ascent to carry it back up.',
    body: [
      'Individuation is the thread that runs through everything else. It is the lifelong process by which a person becomes a psychological individual: a separate, indivisible whole. It proceeds by making unconscious contents conscious and integrating them, meeting the persona, the shadow, the anima or animus and the archetypes, and orienting toward the Self.',
      'Jung stressed that it is not individualism, and not perfection. It is about completeness, including one\'s limits and darkness, and it brings a person into deeper relation with others and the world. The movement is a spiral: down into the unconscious, back up, again and again, each turn closer to the centre.',
    ],
    sources: [
      'Two Essays on Analytical Psychology, CW 7',
      '"Conscious, Unconscious, and Individuation" (1939), CW 9i',
      '"A Study in the Process of Individuation" (1934/1950), CW 9i',
    ],
    popular: 'Individuation is sometimes presented as self-improvement or achieving one\'s full potential. Jung insisted it could not be forced, often began in crisis, and led toward wholeness rather than success.',
    quote: {
      text: 'Individuation means becoming a single, homogeneous being, and, in so far as "individuality" embraces our innermost, last, and incomparable uniqueness, it also implies becoming one\'s own self.',
      source: 'Two Essays on Analytical Psychology, CW 7, para. 266',
    },
    question: 'What have you found on this descent that you want to carry back up into your ordinary life?',
  },
];

N.misattributed = [
  {
    text: 'Until you make the unconscious conscious, it will direct your life and you will call it fate.',
    note: 'Not a Jung sentence. It paraphrases Aion, CW 9ii, para. 126, where Jung writes that when an inner situation is not made conscious, it happens outside, as fate.',
  },
  {
    text: 'I am not what happened to me, I am what I choose to become.',
    note: 'Widely attributed to Jung, with no source in his works.',
  },
];

N.biography = [
  { year: '1875', text: 'Born 26 July in Kesswil on Lake Constance, Switzerland, son of a Protestant pastor. Grows up near Basel.' },
  { year: '1895', text: 'Studies medicine at the University of Basel, and chooses psychiatry.' },
  { year: '1900', text: 'Joins the Burghölzli psychiatric clinic in Zürich under Eugen Bleuler.' },
  { year: '1902', text: 'Doctoral thesis, On the Psychology and Pathology of So-Called Occult Phenomena, based on séances with his cousin.' },
  { year: '1903', text: 'Marries Emma Rauschenbach, later an analyst in her own right.' },
  { year: '1904', text: 'Word-association research at the Burghölzli; develops the idea of the feeling-toned complex.' },
  { year: '1906', text: 'Begins corresponding with Sigmund Freud.' },
  { year: '1907', text: 'Meets Freud in Vienna. Their first conversation famously runs for many hours.' },
  { year: '1909', text: 'Travels with Freud to lecture at Clark University in the United States. Leaves the Burghölzli for private practice in Küsnacht.' },
  { year: '1910', text: 'First president of the International Psychoanalytic Association.' },
  { year: '1912', text: 'Publishes Transformations and Symbols of the Libido (later revised as Symbols of Transformation). Its view of libido as general psychic energy breaks with Freud.' },
  { year: '1913', text: 'Break with Freud. Late in the year begins his "confrontation with the unconscious": visions and active imagination recorded in the Black Books and the Red Book, worked on until about 1930.' },
  { year: '1916', text: 'Writes "The Transcendent Function" and begins drawing mandalas.' },
  { year: '1921', text: 'Psychological Types.' },
  { year: '1923', text: 'His mother dies. Begins building the stone Tower at Bollingen on Lake Zürich, extended over the following decades.' },
  { year: '1928', text: 'Richard Wilhelm sends him The Secret of the Golden Flower, confirming his interest in alchemy and Eastern texts as parallels to the individuation process.' },
  { year: '1933', text: 'Becomes president of the General Medical Society for Psychotherapy during the Nazi period. His role and some of his statements in these years remain the subject of serious criticism and debate.' },
  { year: '1944', text: 'Suffers a heart attack and has visions near death, described in Memories, Dreams, Reflections. Psychology and Alchemy published.' },
  { year: '1948', text: 'The C. G. Jung Institute is founded in Zürich.' },
  { year: '1951', text: 'Aion.' },
  { year: '1952', text: 'Synchronicity, published with Wolfgang Pauli, and Answer to Job.' },
  { year: '1955', text: 'Emma Jung dies.' },
  { year: '1959', text: 'Interviewed by John Freeman on the BBC programme Face to Face.' },
  { year: '1961', text: 'Dies 6 June at his home in Küsnacht.' },
  { year: '1962', text: 'Memories, Dreams, Reflections published, recorded and edited by Aniela Jaffé. It is partly Jaffé\'s composition, not a straightforward autobiography.' },
  { year: '1964', text: 'Man and His Symbols, written with Marie-Louise von Franz, Joseph Henderson, Jolande Jacobi and Aniela Jaffé.' },
  { year: '2009', text: 'The Red Book is published for the first time, edited by Sonu Shamdasani.' },
];

N.reading = {
  start: [
    { title: 'Memories, Dreams, Reflections', note: 'Recorded and edited by Aniela Jaffé, 1962. The inner life, in something close to his own voice. The best first book.' },
    { title: 'Man and His Symbols', note: 'With von Franz, Henderson, Jacobi and Jaffé, 1964. Written for general readers, heavily illustrated.' },
  ],
  collected: [
    { title: 'Psychological Types', note: 'CW 6, 1921. Chapter X is the typology itself.' },
    { title: 'Two Essays on Analytical Psychology', note: 'CW 7. The persona, the shadow, anima and animus, individuation.' },
    { title: 'Symbols of Transformation', note: 'CW 5. The hero, the mother, libido as psychic energy.' },
    { title: 'The Structure and Dynamics of the Psyche', note: 'CW 8. Complexes, dreams, the transcendent function, synchronicity.' },
    { title: 'The Archetypes and the Collective Unconscious', note: 'CW 9i. The core essays on archetypes, mother, child, trickster and mandalas.' },
    { title: 'Aion', note: 'CW 9ii. The ego, shadow, syzygy and Self in their clearest form.' },
    { title: 'Psychology and Alchemy', note: 'CW 12. Individuation traced through a dream series and alchemical images.' },
  ],
  primary: [
    { title: 'The Red Book: Liber Novus', note: 'Edited by Sonu Shamdasani, 2009. The record of his confrontation with the unconscious, with his own paintings.' },
  ],
  links: [
    { label: 'Princeton University Press, publisher of the Collected Works (Bollingen Series)', href: 'https://press.princeton.edu' },
    { label: 'The Philemon Foundation, which prepares Jung\'s unpublished works', href: 'https://philemonfoundation.org' },
  ],
};
