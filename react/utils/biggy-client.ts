import ApolloClient, { ApolloQueryResult } from "apollo-client";
import { getCookie, setCookie } from "./dom-utils";

import suggestionProducts from "../graphql/suggestionProducts.gql";
import suggestionSearches from "../graphql/suggestionSearches.gql";
import topSearches from "../graphql/topSearches.gql";
import searchResult from "../graphql/searchResult.gql";
import { ISearchProduct } from "../models/search-product";

export default class BiggyClient {
  private historyKey = "biggy-search-history";

  constructor(private client: ApolloClient<any>) {}

  public async topSearches(): Promise<
    ApolloQueryResult<{ topSearches: ISearchesOutput }>
  > {
    return this.client.query({
      query: topSearches,
    });
  }

  public async suggestionSearches(
    term: string,
  ): Promise<ApolloQueryResult<{ suggestionSearches: ISearchesOutput }>> {
    return this.client.query({
      query: suggestionSearches,
      variables: {
        term,
      },
    });
  }

  public async suggestionProducts(
    term: string,
    attributeKey?: string,
    attributeValue?: string,
    productOrigin: "BIGGY" | "VTEX" = "BIGGY",
    indexingType: "XML" | "API" = "API",
  ): Promise<ApolloQueryResult<{ suggestionProducts: IProductsOutput }>> {
    return this.client.query({
      query: suggestionProducts,
      variables: {
        term,
        attributeKey,
        attributeValue,
        productOrigin,
        indexingType,
      },
      fetchPolicy: "network-only",
    });
  }

  public searchHistory(): string[] {
    const history = getCookie(this.historyKey) || "";

    return history.split(",").filter(x => !!x);
  }

  public prependSearchHistory(term: string, limit: number = 5) {
    if (term == null || term.trim() === "") {
      return;
    }

    let history = this.searchHistory();

    if (history.indexOf(term) < 0) {
      history.unshift(term);
      history = history.slice(0, limit);
    }

    setCookie(this.historyKey, history.join(","));
  }

  async searchResult(
    attributePath: string,
    query: string,
    page: number,
    sort?: string,
    count?: number,
    operator?: string,
    fuzzy?: string,
  ) {
    return this.client.query({
      query: searchResult,
      variables: {
        attributePath,
        query,
        page,
        sort,
        count,
        operator,
        fuzzy,
      },
    });
  }
}

interface ISearchesOutput {
  searches: ISuggestionQueryResponseSearch[];
}

interface IProductsOutput {
  products: ISearchProduct[];
  count: number;
  misspelled: boolean;
  operator: string;
}

interface ISuggestionQueryResponseSearch {
  term: string;
  count: number;
  attributes: IElasticProductText[];
}

interface IElasticProductText {
  key: string;
  value: string;
  labelKey: string;
  labelValue: string;
}

export interface IElasticProductInstallment {
  count: number;
  value: number;
  interest: boolean;
  valueText: string;
}

interface IElasticProductText {
  key: string;
  value: string;
  labelKey: string;
  labelValue: string;
}

export interface IExtraInfo {
  key: string;
  value: string;
}
