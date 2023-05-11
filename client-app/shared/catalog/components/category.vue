<template>
  <div
    class="grow bg-gray-100 pt-4 pb-16 shadow-inner lg:pt-6"
    :class="{ 'polygon-gray-bg': !products.length && !loading }"
  >
    <div class="mx-auto max-w-screen-2xl px-5 2xl:px-18">
      <!-- Breadcrumbs -->
      <VcBreadcrumbs v-if="!isSearchPage" class="mb-2.5 md:mb-4" :items="breadcrumbs" />

      <div class="flex items-start lg:gap-6">
        <!-- Mobile sidebar back cover -->
        <VcPopupSidebar
          v-if="isMobile"
          :is-visible="mobileSidebarVisible"
          class="flex w-70 flex-col px-5 pt-5"
          @hide="hideMobileSidebar()"
        >
          <div class="relative mt-0.5 mb-6 pr-6">
            <div class="break-words pt-1 text-26 font-semibold">
              {{ $t("common.buttons.filters") }}
            </div>

            <button type="button" class="absolute top-2.5 right-1" @click="hideMobileSidebar()">
              <svg class="h-5 w-5 text-[color:var(--color-primary)]">
                <use href="/static/images/delete.svg#main" />
              </svg>
            </button>
          </div>

          <ProductsFiltersSidebar
            class="grow"
            :keyword="keywordQueryParam"
            :filters="mobileFilters"
            :loading="loading || facetsLoading"
            @search="
              onSearchStart($event);
              hideMobileSidebar();
            "
            @change="updateMobileFilters($event)"
            @open-branches="openBranchesDialog(true)"
          />

          <div class="z-100 sticky bottom-0 -mx-5 mt-4 h-24 bg-white p-5 shadow-t-md">
            <div class="flex space-x-4">
              <VcButton
                class="flex-1 uppercase"
                size="lg"
                is-outline
                :is-disabled="!isExistSelectedFacets && !isExistSelectedMobileFacets"
                @click="
                  resetFacetFilters();
                  hideMobileSidebar();
                "
              >
                {{ $t("common.buttons.reset") }}
              </VcButton>

              <VcButton
                class="flex-1 uppercase"
                size="lg"
                :is-disabled="!isMobileFilterDirty"
                @click="
                  applyFilters(mobileFilters);
                  hideMobileSidebar();
                "
              >
                {{ $t("common.buttons.apply") }}
              </VcButton>
            </div>
          </div>
        </VcPopupSidebar>

        <!-- Sidebar -->
        <div v-else class="w-60 shrink-0 space-y-5">
          <CategorySelector
            v-if="!isSearchPage"
            :category="currentCategory"
            :loading="!currentCategory && loadingCategory"
          />

          <ProductsFiltersSidebar
            :keyword="keywordQueryParam"
            :filters="{ facets, inStock: savedInStock, branches: savedBranches }"
            :loading="loading"
            @search="onSearchStart($event)"
            @change="applyFilters($event)"
          />
        </div>

        <!-- Content -->
        <div class="grow">
          <div class="flex">
            <h2 class="text-21 font-bold uppercase text-gray-800 lg:my-px lg:text-25 lg:leading-none">
              <i18n-t v-if="isSearchPage" keypath="pages.search.header" tag="span">
                <template #keyword>
                  <strong>{{ searchParams.keyword }}</strong>
                </template>
              </i18n-t>

              <!-- Skeleton -->
              <span v-else-if="!currentCategory && loadingCategory" class="inline-block w-48 bg-gray-200 md:w-64">
                &nbsp;
              </span>

              <span v-else>
                {{ currentCategory?.name }}
              </span>

              <sup
                v-if="!loading"
                class="-top-1 ml-2 whitespace-nowrap text-sm font-normal normal-case text-[color:var(--color-category-page-results)] lg:top-[-0.5em] lg:text-15"
              >
                <b class="font-extrabold">{{ total }}</b>
                {{ $t("pages.catalog.products_found_message", total) }}
              </sup>
            </h2>
          </div>

          <div ref="stickyMobileHeaderAnchor" class="-mt-px"></div>

          <div
            class="sticky top-0 z-10 my-1.5 flex h-14 items-center lg:relative lg:mb-3.5 lg:mt-3 lg:h-auto lg:flex-wrap lg:justify-end"
            :class="{
              'z-40 -mx-5 bg-[color:var(--color-header-bottom-bg)] px-5 md:-mx-12 md:px-12':
                stickyMobileHeaderIsVisible,
            }"
          >
            <!-- Mobile filters toggler -->
            <div class="mr-2.5 lg:hidden">
              <VcButton class="pl-2.5 pr-2 !font-lato !text-15 font-bold" size="md" @click="showMobileSidebar">
                <i class="fas fa-filter mr-2"></i> {{ $t("pages.catalog.filters_button") }}
              </VcButton>
            </div>

            <!-- Sorting -->
            <div class="z-10 ml-auto flex grow items-center lg:order-4 lg:ml-4 lg:grow-0 xl:ml-8">
              <span
                v-t="'pages.catalog.sort_by_label'"
                class="mr-2 hidden shrink-0 text-15 font-bold text-[color:var(--color-category-page-label)] lg:block"
              />

              <VcSelect
                v-model="sortQueryParam"
                text-field="name"
                value-field="id"
                :disabled="loading"
                :items="PRODUCT_SORTING_LIST"
                class="w-full lg:w-48"
                size="sm"
              />
            </div>

            <!-- View options -->
            <ViewMode v-model:mode="savedViewMode" class="ml-3 inline-flex lg:order-1 lg:ml-0 lg:mr-auto" />

            <!-- Branch availability -->
            <div
              v-if="!isMobile"
              class="order-3 ml-4 flex items-center xl:ml-6"
              @click.prevent="openBranchesDialog(false)"
              @keyup.enter.prevent="openBranchesDialog(false)"
            >
              <VcTooltip :x-offset="28" placement="bottom-start" strategy="fixed">
                <template #trigger>
                  <VcCheckbox :model-value="!!savedBranches.length" :disabled="loading">
                    <i18n-t
                      keypath="pages.catalog.branch_availability_filter_card.available_in"
                      tag="div"
                      class="text-15"
                      :class="{
                        'text-[color:var(--color-category-page-checkbox-label)]': !savedBranches.length,
                      }"
                      scope="global"
                    >
                      <span :class="{ 'font-bold text-[color:var(--color-link)]': savedBranches.length }">
                        {{ $t("pages.catalog.branch_availability_filter_card.branches", { n: savedBranches.length }) }}
                      </span>
                    </i18n-t>
                  </VcCheckbox>
                </template>

                <template #content>
                  <div class="w-52 rounded-sm bg-white py-1.5 px-3.5 text-xs text-tooltip shadow-sm-x-y">
                    {{ $t("pages.catalog.branch_availability_filter_card.select_branch_text") }}
                  </div>
                </template>
              </VcTooltip>
            </div>

            <!-- In Stock -->
            <div v-if="!isMobile" class="order-2 ml-4 flex items-center xl:ml-8">
              <VcTooltip :x-offset="28" placement="bottom-start" strategy="fixed">
                <template #trigger>
                  <VcCheckbox v-model="savedInStock" :disabled="loading">
                    <span
                      class="whitespace-nowrap text-15"
                      :class="{
                        'text-[color:var(--color-category-page-checkbox-label)]': !savedInStock,
                      }"
                    >
                      {{ $t("pages.catalog.instock_filter_card.checkbox_label") }}
                    </span>
                  </VcCheckbox>
                </template>

                <template #content>
                  <div class="w-52 rounded-sm bg-white py-1.5 px-3.5 text-xs text-tooltip shadow-sm-x-y">
                    {{ $t("pages.catalog.instock_filter_card.tooltip_text") }}
                  </div>
                </template>
              </VcTooltip>
            </div>
          </div>

          <!-- Filters chips -->
          <div v-if="isExistSelectedFacets" class="flex flex-wrap gap-x-3 gap-y-2 pb-6">
            <template v-for="facet in facets">
              <template v-for="filterItem in facet.values">
                <VcChip
                  v-if="filterItem.selected"
                  :key="facet.paramName + filterItem.value"
                  size="sm"
                  variant="secondary"
                  closable
                  @close="
                    removeFacetFilterItem({
                      paramName: facet.paramName,
                      value: filterItem.value,
                    })
                  "
                >
                  {{ filterItem.label }}
                </VcChip>
              </template>
            </template>

            <VcChip size="sm" variant="secondary" is-outline clickable @click="resetFacetFilters">
              {{ $t("common.buttons.reset_filters") }}

              <VcIcon class="ml-2" name="reset" size="xs" />
            </VcChip>
          </div>

          <!-- Products -->
          <template v-if="products.length || loading">
            <DisplayProducts
              :loading="loading"
              :view-mode="savedViewMode"
              :items-per-page="itemsPerPage"
              :products="products"
              :class="
                savedViewMode === 'list'
                  ? '-mx-5 divide-y lg:divide-y-0 lg:mx-0 lg:space-y-3.5'
                  : 'grid gap-6 xs:grid-cols-2 md:grid-cols-3 lg:gap-5 xl:grid-cols-4'
              "
              @item-link-click="sendGASelectItemEvent"
            >
              <template #cart-handler="{ item }">
                <AddToCart :product="item" :reserved-space="savedViewMode === 'grid'" />
              </template>
            </DisplayProducts>

            <VcInfinityScrollLoader
              v-if="!loading"
              :loading="loadingMore"
              distance="400"
              class="mt-9 -mb-6"
              @visible="loadMoreProducts"
            />

            <VcScrollTopButton />
          </template>

          <!-- Empty view -->
          <VcEmptyView
            v-else
            :text="
              isExistSelectedFacets || savedInStock || savedBranches.length || keywordQueryParam
                ? $t('pages.catalog.no_products_filtered_message')
                : $t('pages.catalog.no_products_message')
            "
            class="h-96"
          >
            <template #icon>
              <VcImage src="/static/images/common/stock.svg" :alt="$t('pages.catalog.products_icon')" />
            </template>

            <template #button>
              <VcButton
                v-if="isExistSelectedFacets || keywordQueryParam"
                class="px-6 uppercase"
                size="lg"
                @click="resetFacetFiltersWithKeyword"
              >
                <i class="fas fa-undo -ml-0.5 mr-2.5 text-inherit"></i>
                {{ $t("pages.catalog.no_products_button") }}
              </VcButton>
            </template>
          </VcEmptyView>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  breakpointsTailwind,
  computedEager,
  useBreakpoints,
  useElementVisibility,
  useLocalStorage,
  watchDebounced,
  whenever,
} from "@vueuse/core";
import { cloneDeep, isEqual } from "lodash";
import { computed, ref, shallowReactive, shallowRef, triggerRef, watch } from "vue";
import { useBreadcrumbs, useGoogleAnalytics, usePageHead, useRouteQueryParam } from "@/core/composables";
import { DEFAULT_PAGE_SIZE, PRODUCT_SORTING_LIST } from "@/core/constants";
import { QueryParamName } from "@/core/enums";
import { buildBreadcrumbs, getFilterExpressionFromFacets } from "@/core/utilities";
import { AddToCart } from "@/shared/cart";
import { BranchesDialog, FFC_LOCAL_STORAGE } from "@/shared/fulfillmentCenters";
import { usePopup } from "@/shared/popup";
import { useCategory, useProducts } from "../composables";
import { getFilterExpressionForAvailableIn, getFilterExpressionForInStock } from "../utils";
import CategorySelector from "./category-selector.vue";
import DisplayProducts from "./display-products.vue";
import ProductsFiltersSidebar from "./products-filters.vue";
import ViewMode from "./view-mode.vue";
import type { FacetItemType, FacetValueItemType } from "@/core/types";
import type { ProductsFilters, ProductsSearchParams } from "@/shared/catalog";
import type { Breadcrumb, Product } from "@/xapi/types";

interface IProps {
  categoryId?: string;
  isSearchPage?: boolean;
}

const props = defineProps<IProps>();

const { openPopup } = usePopup();
const breakpoints = useBreakpoints(breakpointsTailwind);
const ga = useGoogleAnalytics();
const {
  fetchProducts,
  fetchMoreProducts,
  getFacets,
  loading,
  loadingMore,
  facetsLoading,
  products,
  total,
  pages,
  facets,
} = useProducts({
  withFacets: true,
});
const { loading: loadingCategory, category: currentCategory, rootCategory, fetchCategory } = useCategory();

const savedViewMode = useLocalStorage<"grid" | "list">("viewMode", "grid");
const savedInStock = useLocalStorage<boolean>("viewInStockProducts", true);
const savedBranches = useLocalStorage<string[]>(FFC_LOCAL_STORAGE, []);

const sortQueryParam = useRouteQueryParam<string>(QueryParamName.Sort, {
  defaultValue: PRODUCT_SORTING_LIST[0].id,
  validator: (value) => PRODUCT_SORTING_LIST.some((item) => item.id === value),
});

const searchQueryParam = useRouteQueryParam<string>(QueryParamName.SearchPhrase, {
  defaultValue: "",
});

const keywordQueryParam = useRouteQueryParam<string>(QueryParamName.Keyword, {
  defaultValue: "",
});

const facetsQueryParam = useRouteQueryParam<string>(QueryParamName.Facets, {
  defaultValue: "",
});

const isMobile = breakpoints.smaller("lg");

const page = ref(1);
const itemsPerPage = ref(DEFAULT_PAGE_SIZE);

const mobileSidebarVisible = ref(false);
const mobileFilters = shallowReactive<ProductsFilters>({
  facets: [],
  inStock: savedInStock.value,
  branches: savedBranches.value,
});

const stickyMobileHeaderAnchor = shallowRef<HTMLElement | null>(null);
const stickyMobileHeaderAnchorIsVisible = useElementVisibility(stickyMobileHeaderAnchor);
const stickyMobileHeaderIsVisible = computed<boolean>(() => !stickyMobileHeaderAnchorIsVisible.value && isMobile.value);

usePageHead({
  title: computed(() => currentCategory.value?.seoInfo?.pageTitle || currentCategory.value?.name),
  meta: {
    keywords: computed(() => currentCategory.value?.seoInfo?.metaKeywords),
    description: computed(() => currentCategory.value?.seoInfo?.metaDescription),
  },
});

const breadcrumbs = useBreadcrumbs(() => {
  const firstItem: Breadcrumb = { itemId: rootCategory.id, title: rootCategory.name, seoPath: rootCategory.slug };
  const items = currentCategory.value
    ? currentCategory.value.breadcrumbs ?? [{ itemId: currentCategory.value.id, title: currentCategory.value.name }]
    : [];

  return buildBreadcrumbs([firstItem].concat(items)) ?? [];
});

const searchParams = computedEager<ProductsSearchParams>(() => ({
  categoryId: props.categoryId,
  itemsPerPage: itemsPerPage.value,
  sort: sortQueryParam.value,
  keyword: props.isSearchPage ? searchQueryParam.value : keywordQueryParam.value,
  filter: [
    facetsQueryParam.value,
    getFilterExpressionForInStock(savedInStock),
    getFilterExpressionForAvailableIn(savedBranches),
  ]
    .filter(Boolean)
    .join(" "),
}));

const isExistSelectedFacets = computedEager<boolean>(() =>
  facets.value.some((facet) => facet.values.some((value) => value.selected))
);

const isExistSelectedMobileFacets = computedEager<boolean>(() =>
  mobileFilters.facets.some((facet) => facet.values.some((value) => value.selected))
);

const isMobileFilterDirty = computedEager<boolean>(
  () =>
    JSON.stringify(mobileFilters) !==
    JSON.stringify({
      facets: facets.value,
      inStock: savedInStock.value,
      branches: savedBranches.value,
    } as ProductsFilters)
);

function sendGASelectItemEvent(product: Product) {
  ga.selectItem(product);
}

function showMobileSidebar() {
  mobileFilters.facets = cloneDeep(facets.value);
  mobileFilters.inStock = savedInStock.value;
  mobileFilters.branches = savedBranches.value.slice();
  mobileSidebarVisible.value = true;
}

function hideMobileSidebar() {
  mobileSidebarVisible.value = false;
}

function onSearchStart(newKeyword: string) {
  const searchText = newKeyword;

  if (searchText !== keywordQueryParam.value && searchText.length <= 30) {
    keywordQueryParam.value = searchText;
  }
}

function applyFilters(newFilters: ProductsFilters) {
  const facetsFilterExpression: string = getFilterExpressionFromFacets(newFilters.facets);

  if (facetsQueryParam.value !== facetsFilterExpression) {
    facetsQueryParam.value = facetsFilterExpression;
  }

  if (savedInStock.value !== newFilters.inStock) {
    savedInStock.value = newFilters.inStock;
  }

  if (!isEqual(savedBranches.value, newFilters.branches)) {
    savedBranches.value = newFilters.branches;
  }
}

async function updateMobileFilters(newFilters: ProductsFilters) {
  const searchParamsForFacets: ProductsSearchParams = {
    ...searchParams.value,
    filter: [
      getFilterExpressionFromFacets(newFilters.facets),
      getFilterExpressionForInStock(newFilters.inStock),
      getFilterExpressionForAvailableIn(newFilters.branches),
    ]
      .filter(Boolean)
      .join(" "),
  };

  mobileFilters.inStock = newFilters.inStock;
  mobileFilters.branches = newFilters.branches;
  mobileFilters.facets = await getFacets(searchParamsForFacets);
}

function removeFacetFilterItem(payload: Pick<FacetItemType, "paramName"> & Pick<FacetValueItemType, "value">) {
  const facet = facets.value.find((item) => item.paramName === payload.paramName);
  const facetValue = facet?.values.find((item) => item.value === payload.value);

  if (facetValue) {
    facetValue.selected = false;
    facetsQueryParam.value = getFilterExpressionFromFacets(facets);

    // Instant update of the filter chips
    triggerRef(facets);
  }
}

function resetFacetFilters() {
  facetsQueryParam.value = "";

  // Instant update of the filter chips
  facets.value.forEach((filter) => filter.values.forEach((filterItem) => (filterItem.selected = false)));
  triggerRef(facets);
}

function resetFacetFiltersWithKeyword() {
  keywordQueryParam.value = "";
  // FIXME: `setTimeout` is a hack to apply the value of `useRouteQueryParam` in parallel
  setTimeout(resetFacetFilters, 0);
}

async function loadProducts() {
  page.value = 1;

  await fetchProducts(searchParams.value);

  /**
   * Send Google Analytics event for products.
   */
  ga.viewItemList(products.value, {
    item_list_id: currentCategory.value?.slug,
    item_list_name: currentCategory.value?.name,
  });
}

async function loadMoreProducts() {
  if (page.value === pages.value) {
    return;
  }

  const nextPage = page.value + 1;

  page.value = nextPage;

  await fetchMoreProducts({
    ...searchParams.value,
    page: nextPage,
  });

  /**
   * Send Google Analytics event for products on next page.
   */
  ga.viewItemList(products.value, {
    item_list_id: `${currentCategory.value?.slug}_page_${nextPage}`,
    item_list_name: `${currentCategory.value?.name} (page ${nextPage})`,
  });
}

function openBranchesDialog(fromMobileFilter: boolean) {
  openPopup({
    component: BranchesDialog,
    props: {
      selectedBranches: fromMobileFilter ? mobileFilters.branches : savedBranches.value,
      onSave(branches: string[]) {
        if (fromMobileFilter) {
          const newFilters: ProductsFilters = {
            branches,
            facets: mobileFilters.facets,
            inStock: mobileFilters.inStock,
          };

          updateMobileFilters(newFilters);
        } else {
          savedBranches.value = branches;
        }
      },
    },
  });
}

whenever(() => !isMobile.value, hideMobileSidebar);

watch(
  () => props.categoryId,
  () => {
    if (!props.isSearchPage) {
      fetchCategory({
        categoryId: props.categoryId,
        maxLevel: 1,
        onlyActive: true,
      });
    }
  },
  { immediate: true }
);

watchDebounced(
  computed(() => JSON.stringify(searchParams.value)),
  loadProducts,
  {
    immediate: true,
    flush: "post",
    debounce: 20,
  }
);
</script>