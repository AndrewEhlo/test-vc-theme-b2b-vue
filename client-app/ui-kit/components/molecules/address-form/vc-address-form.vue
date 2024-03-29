<template>
  <form class="overflow-x-hidden" @submit.prevent="save">
    <slot name="prepend" v-bind="slotsData" />

    <div :class="{ 'md:flex md:flex-row': withPersonalInfo }">
      <div v-if="withPersonalInfo" class="md:w-1/2">
        <VcInput
          v-model.trim="firstName"
          :message="errors.firstName"
          :error="!!errors.firstName"
          :disabled="disabled"
          :label="$t('common.labels.first_name')"
          class="mb-4"
          required
          :maxlength="64"
        />

        <VcInput
          v-model.trim="lastName"
          :message="errors.lastName"
          :error="!!errors.lastName"
          :disabled="disabled"
          :label="$t('common.labels.last_name')"
          class="mb-4"
          required
          :maxlength="64"
        />

        <VcInput
          v-model.trim="email"
          :message="errors.email"
          :error="!!errors.email"
          :disabled="disabled"
          :required="requiredEmail"
          :label="$t('common.labels.email')"
          class="mb-4"
          :maxlength="64"
        />

        <VcInput
          v-model.trim="phone"
          :message="errors.phone"
          :error="!!errors.phone"
          :disabled="disabled"
          :required="requiredPhone"
          :label="$t('common.labels.phone')"
          class="mb-4"
          :maxlength="64"
        />
      </div>

      <!-- Divider -->
      <div
        v-if="withPersonalInfo"
        class="-mx-96 mb-6 mt-8 border-t border-[color:var(--color-primary)] md:mx-9 md:mb-4 md:mt-6 md:border-l"
      />

      <div :class="{ 'md:w-1/2': withPersonalInfo }">
        <VcInput
          v-if="withDescriptionField"
          v-model.trim="description"
          :message="(errors as Record<string, string>).description"
          :error="!!(errors as Record<string, string>).description"
          :disabled="disabled"
          :label="$t('common.labels.description')"
          class="mb-4"
          :maxlength="128"
        />

        <div class="flex flex-col xl:flex-row xl:flex-wrap">
          <VcSelect
            v-model="country"
            text-field="name"
            :message="errors.countryCode"
            :error="!!errors.countryCode"
            :disabled="disabled"
            :items="countries"
            :label="$t('common.labels.country')"
            :placeholder="$t('common.placeholders.select_country')"
            class="mb-4 w-full xl:w-7/12"
            required
            autocomplete
          />

          <VcInput
            v-model.trim="postalCode"
            :message="errors.postalCode"
            :error="!!errors.postalCode"
            :disabled="disabled"
            :label="$t('common.labels.zip_or_postal_code')"
            class="order-3 mb-4 xl:order-none xl:ml-4 xl:w-4/12 xl:grow"
            required
            :maxlength="32"
          />

          <VcSelect
            v-model="region"
            text-field="name"
            :items="regions"
            :message="errors.regionId"
            :error="!!errors.regionId"
            :required="!!regions.length"
            :disabled="disabled || !regions.length"
            :label="$t('common.labels.region')"
            :placeholder="$t('common.placeholders.select_region')"
            class="order-2 mb-4 xl:order-none xl:w-5/12"
            autocomplete
          />

          <VcInput
            v-model.trim="city"
            :message="errors.city"
            :error="!!errors.city"
            :disabled="disabled"
            :label="$t('common.labels.city')"
            class="order-4 mb-4 xl:order-none xl:ml-4 xl:grow"
            :required="requiredCity"
            :maxlength="128"
          />
        </div>

        <VcInput
          v-model.trim="line1"
          :message="errors.line1"
          :error="!!errors.line1"
          :disabled="disabled"
          :label="$t('common.labels.address_line1')"
          class="mb-4"
          required
          :maxlength="128"
        />

        <VcInput
          v-model.trim="line2"
          :message="errors.line2"
          :error="!!errors.line2"
          :disabled="disabled"
          :label="$t('common.labels.address_line2')"
          class="mb-4"
          :maxlength="128"
        />
      </div>
    </div>

    <slot name="append" v-bind="slotsData" />
  </form>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { clone } from "lodash";
import { useField, useForm } from "vee-validate";
import { computed, ref, watch } from "vue";
import { string as yupString } from "yup";
import { getAddressName, Logger } from "@/core/utilities";
import type { CountryRegionType, CountryType, MemberAddressType } from "@/core/api/graphql/types";

interface IEmits {
  (event: "update:modelValue", address: MemberAddressType): void;
  (event: "save", address: MemberAddressType): void;
}

interface IProps {
  modelValue?: MemberAddressType;
  disabled?: boolean;
  requiredEmail?: boolean;
  requiredPhone?: boolean;
  requiredCity?: boolean;
  withDescriptionField?: boolean;
  withPersonalInfo?: boolean;
  countries?: CountryType[];
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  countries: () => [],
});

const _emptyAddress: Readonly<MemberAddressType> = {
  isDefault: false,
  isFavorite: false,
  firstName: "",
  lastName: "",
  email: "",
  organization: "",
  postalCode: "",
  countryCode: "",
  countryName: "",
  regionId: "",
  regionName: "",
  city: "",
  line1: "",
  line2: "",
  phone: "",
};

const initialValues = ref<MemberAddressType>(clone(props.modelValue || _emptyAddress));

const {
  values,
  meta,
  errors,
  handleSubmit,
  setValues,
  setErrors,
  validate,
  resetForm: reset,
} = useForm({ initialValues });

const slotsData = computed(() => ({
  setErrors,
  validate,
  reset,
  save,
  errors,
  values,
  dirty: meta.value.dirty,
  valid: meta.value.valid,
  validated: meta.value.validated,
  pending: meta.value.pending,
  touched: meta.value.touched,
}));

const emailRules = computed(() => {
  let rules = yupString().max(64).email().nullable();
  if (props.withPersonalInfo && props.requiredEmail) {
    rules = rules.required();
  }
  return toTypedSchema(rules);
});

const phoneRules = computed(() => {
  let rules = yupString().max(64).nullable();
  if (props.withPersonalInfo && props.requiredPhone) {
    rules = rules.required();
  }
  return toTypedSchema(rules);
});

const cityRules = computed(() => {
  let rules = yupString().max(128).nullable();
  if (props.requiredCity) {
    rules = rules.required();
  }
  return toTypedSchema(rules);
});

const regionRules = computed(() => {
  let rules = yupString().nullable();
  if (regions.value.length) {
    rules = rules.required();
  }
  return toTypedSchema(rules);
});

const firstNameRules = computed(() => {
  let rules = yupString().max(64).nullable();
  if (props.withPersonalInfo) {
    rules = rules.required();
  }
  return toTypedSchema(rules);
});

const lastNameRules = computed(() => {
  let rules = yupString().max(64).nullable();
  if (props.withPersonalInfo) {
    rules = rules.required();
  }
  return toTypedSchema(rules);
});

const country = computed<CountryType | undefined>({
  get: () => props.countries.find((item) => countryCode.value === item.id),
  set: (value?: CountryType) => {
    countryCode.value = value?.id ?? "";
    countryName.value = value?.name ?? "";
    regionId.value = "";
    regionName.value = "";
  },
});
const regions = computed<CountryRegionType[]>(() => country.value?.regions ?? []);
const region = computed<CountryRegionType | undefined>({
  get: () => regions.value.find((item) => regionId.value === item.id),
  set: (value?: CountryRegionType) => {
    regionId.value = value?.id ?? "";
    regionName.value = value?.name ?? "";
  },
});

const { value: email } = useField("email", emailRules, { syncVModel: false });
const { value: city } = useField("city", cityRules, { syncVModel: false });
const { value: phone } = useField("phone", phoneRules, { syncVModel: false });
const { value: firstName } = useField("firstName", firstNameRules, { syncVModel: false });
const { value: lastName } = useField("lastName", lastNameRules, { syncVModel: false });
const { value: postalCode } = useField("postalCode", toTypedSchema(yupString().max(32).required().nullable()), {
  syncVModel: false,
});
const { value: countryCode } = useField("countryCode", toTypedSchema(yupString().required().nullable()), {
  syncVModel: false,
});
const { value: countryName } = useField("countryName", toTypedSchema(yupString().max(128).nullable()), {
  syncVModel: false,
});
const { value: regionName } = useField("regionName", toTypedSchema(yupString().max(128).nullable()), {
  syncVModel: false,
});
const { value: regionId } = useField("regionId", regionRules, { syncVModel: false });
const { value: line1 } = useField("line1", toTypedSchema(yupString().max(128).required().nullable()), {
  syncVModel: false,
});
const { value: line2 } = useField("line2", toTypedSchema(yupString().max(128).nullable()), { syncVModel: false });
const { value: description } = useField("description", toTypedSchema(yupString().max(128).nullable()), {
  syncVModel: false,
});

const save = handleSubmit((address) => {
  const newAddress: MemberAddressType = { ...address, name: getAddressName(address) };
  emit("update:modelValue", newAddress);
  emit("save", newAddress);
}, Logger.debug);

watch(
  () => props.modelValue,
  (value) => {
    initialValues.value = clone(value || _emptyAddress);
    setValues(initialValues.value);
  },
  { deep: true },
);
</script>
