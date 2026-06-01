import type { ImageMetadata } from 'astro';
import tooth1 from '../assets/images/tooth1.png';
import tooth2 from '../assets/images/tooth2.png';
import tooth3 from '../assets/images/tooth3.png';
import tooth4 from '../assets/images/tooth4.png';
import tooth5 from '../assets/images/tooth5.png';
import tooth6 from '../assets/images/tooth6.png';
import tooth7 from '../assets/images/tooth7.png';
import tooth8 from '../assets/images/tooth8.png';
import tooth9 from '../assets/images/tooth9.png';
import tooth10 from '../assets/images/tooth10.png';
import tooth11 from '../assets/images/tooth11.png';
import tooth12 from '../assets/images/tooth12.png';

export interface NavItem {
  label: string;
  href: string;
  image: ImageMetadata;
}

export const surgeryNavItems: NavItem[] = [
  { label: 'Dental Implants', href: '/surgery/dental-implants', image: tooth1 },
  { label: 'Wisdom Teeth', href: '/surgery/wisdom-teeth', image: tooth2 },
  { label: 'Tooth Extraction', href: '/surgery/tooth-extraction', image: tooth3 },
  { label: 'Bone Grafting', href: '/surgery/bone-grafting', image: tooth4 },
  { label: 'Orthodontic Surgery', href: '/surgery/orthodontic-surgery', image: tooth5 },
  { label: 'Facial Trauma', href: '/surgery/facial-trauma', image: tooth6 },
  { label: 'Oral Pathology', href: '/surgery/oral-pathology', image: tooth7 },
  { label: 'Jaw Corrective', href: '/surgery/jaw-corrective', image: tooth8 },
  { label: 'TMJ Disorder', href: '/surgery/tmj-disorder', image: tooth9 },
];

export const afterSurgeryNavItems: NavItem[] = [
  { label: 'General Instructions', href: '/after-surgery/general-instructions', image: tooth10 },
  { label: 'Tooth Removal', href: '/after-surgery/tooth-removal', image: tooth3 },
  { label: 'Wisdom Teeth Removal', href: '/after-surgery/wisdom-teeth-removal', image: tooth2 },
  { label: 'Facial Trauma', href: '/after-surgery/facial-trauma', image: tooth6 },
  { label: 'Exposure of Impacted Tooth', href: '/after-surgery/exposure-of-impacted-tooth', image: tooth11 },
  { label: 'Placement of Dental Implants', href: '/after-surgery/placement-of-dental-implants', image: tooth1 },
  { label: 'Removal of Multiple Teeth', href: '/after-surgery/removal-of-multiple-teeth', image: tooth12 },
];
