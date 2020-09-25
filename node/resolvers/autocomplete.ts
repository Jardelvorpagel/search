import { SegmentData } from "@vtex/api";
import { path } from "ramda";
import { IndexingType } from "./products";

export interface SuggestionSearchesArgs {
  term: string;
}

export interface SuggestionProductsArgs {
  term: string;
  attributeKey?: string;
  attributeValue?: string;
  tradePolicy?: string;
  segment?: SegmentData;
  indexingType?: IndexingType;
}

export const autocomplete = {
  topSearches: async (_: any, __: any, ctx: Context) => {
    const { biggySearch } = ctx.clients;

    return await biggySearch.topSearches();
  },

  suggestionSearches: async (
    _: any,
    args: SuggestionSearchesArgs,
    ctx: Context,
  ) => {
    const { biggySearch } = ctx.clients;

    return await biggySearch.suggestionSearches(args);
  },

  suggestionProducts: async (
    _: any,
    args: SuggestionProductsArgs,
    ctx: Context,
  ) => {
    const { biggySearch } = ctx.clients;

    const tradePolicy = path<string | undefined>(["segment", "channel"], args);

    const result = await biggySearch.suggestionProducts({
      ...args,
      tradePolicy,
    });

    const {
      count,
      operator,
      correction: { misspelled },
      products
    } = result


    return {count, operator, misspelled, products};
  },
};
