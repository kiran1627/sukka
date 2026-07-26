export interface Photo {
  id: string;
  src: string;
  caption: string;
  date: string;
}

export interface Video {
  id: string;
  src: string;
  caption: string;
  date: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  image: string;
  icon: string;
}

export interface GalleryItem {
  id: string;
  src: string;
  caption: string;
}

export interface SpecialDate {
  date: string;
  label: string;
}



export interface BucketListItem {
  id: string;
  item: string;
  done: boolean;
}

export interface LoveCoupon {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface MusicConfig {
  scenes: Record<string, string>;
  effects: Record<string, string>;
}

export interface QuestionConfig {
  text: string;
  yesText: string;
  noText: string;
  noMessages: string[];
  noClickMessage: string;
}

export interface AuroraContent {
  recipientName: string;
  password: string;
  bootMessages: string[];
  photos: Photo[];
  videos: Video[];
  music: MusicConfig;
  timeline: TimelineEvent[];
  quotes: string[];
  loveLetter: string;
  gallery: GalleryItem[];
  specialDates: SpecialDate[];
  personalNote: string;
  futureDreams: string[];
  bucketList: BucketListItem[];
  reasonsILoveYou: string[];
  loveCoupons: LoveCoupon[];
  promiseWall: string[];
  question: QuestionConfig;
  finalMessage: string;
  celebrationTexts: string[];
}

export type SceneId =
  | 'boot'
  | 'galaxy'
  | 'moon'
  | 'butterflies'
  | 'password'
  | 'forest'
  | 'giftBox'
  | 'memoryTunnel'
  | 'timeline'
  | 'cake'
  | 'letter'
  | 'question'
  | 'celebration'
  | 'auroraSky'
  | 'hiddenSurprise';

export const SCENE_ORDER: SceneId[] = [
  'boot',
  'galaxy',
  'moon',
  'butterflies',
  'password',
  'forest',
  'giftBox',
  'memoryTunnel',
  'timeline',
  'cake',
  'letter',
  'question',
  'celebration',
  'auroraSky',
  'hiddenSurprise',
];
