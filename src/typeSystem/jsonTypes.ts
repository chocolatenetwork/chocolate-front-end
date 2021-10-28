/* eslint-disable no-use-before-define */
// Generated by https://quicktype.io

import { AnyNumber } from '@polkadot/types/types';

export interface Chocolate {
  User: User;
  ReviewAl: ChainReview;
  ProjectAl: ChainProject;
  ListOfNames: string[];
  TextAl: string;
  Project: ChainProject;
  ProjectID: AnyNumber;
  ReviewID: AnyNumber;
  ProposalStatus: ProposalStatus;
  Status: Status['_enum'];
  Reason: Reason['_enum'];
  MetaData: ChainMetaData;
  Review: ChainReview;
  Balance: AnyNumber;
  BalanceOf: AnyNumber;
  ChainProjectWithIndex: ChainProjectWithIndex;
}
export interface ChainProjectWithIndex {
  Id: AnyNumber;
  project: ChainProject;
}
export interface NewProjectWithIndex {
  Id: AnyNumber;
  project: NewProject;
}
export type ChainMetaData = string;

export interface ChainProject {
  ownerID: string;
  reviewers?: string[];
  reviews?: AnyNumber[];
  badge?: boolean;
  metaData: ChainMetaData;
  proposalStatus: ProposalStatus;
}

export interface ProposalStatus {
  status: Status['_enum'];
  reason: Reason['_enum'];
}

export interface Reason {
  _enum: Partial<ReasonEnum>;
}

export interface ReasonEnum {
  Other: string;
  InsufficientMetaData: null;
  Malicious: null;
  PassedRequirements: null;
}

export interface ChainReview {
  proposalStatus: ProposalStatus;
  userID: string;
  content: string;
  projectID: AnyNumber;
}

export interface NewMetaData {
  /** If doesn't exist polyfill */
  Link?: string;
  name: string;
  description: string;
  /** @deprecated, use icon instead, only the first struct makes use of this, the rest use icon */
  image?: string;
  icon?: string;
  date: number;
}

export type NewProject = Omit<ChainProject, 'metaData'> & {
  metaData: NewMetaData;
};

// store on ipfs fully
export interface ReviewContent {
  reviewText: string;
  rating: AnyNumber;
}
export type NewReview = Omit<ChainReview, 'content'> & {
  content: ReviewContent;
};

export interface Status {
  _enum: 'Proposed' | 'Accepted' | 'Rejected';
}

export interface User {
  rankPoints: AnyNumber;
}
