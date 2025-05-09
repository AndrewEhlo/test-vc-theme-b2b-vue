<template>
  <form @submit="onSubmit">
    <!-- Errors block -->
    <VcAlert
      v-for="error in translatedErrors"
      :key="error.code"
      class="mb-4"
      color="danger"
      size="sm"
      variant="outline-dark"
      icon
    >
      <span v-if="error?.code === IdentityErrors.USER_IS_LOCKED_OUT">
        {{ error.translation }}
        <ContactAdministratorLink />.
      </span>

      <span v-else-if="error?.code === IdentityErrors.PASSWORD_EXPIRED" class="flex place-items-center justify-between">
        <span>
          {{ error.translation }}
        </span>
        <!-- Keep the A tag to reinitialize the app -->
        <a href="/change-password" class="text-sm font-semibold text-blue-700 hover:text-blue-500">
          {{ $t("common.buttons.set_new_password") }}
        </a>
      </span>

      <span v-else>
        {{ error.translation }}
      </span>
    </VcAlert>

    <VcInput
      v-model.trim="email"
      name="email"
      class="mb-4"
      :label="$t('common.labels.email')"
      :placeholder="$t('common.placeholders.email')"
      :disabled="loading"
      required
      :message="validationErrors.email"
      :error="!!validationErrors.email"
      autocomplete="email"
    />

    <VcInput
      v-model="password"
      class="mb-4"
      :label="$t('common.labels.password')"
      :placeholder="$t('common.placeholders.password')"
      :disabled="loading"
      type="password"
      required
      :message="validationErrors.password"
      :error="!!validationErrors.password"
      autocomplete="password"
    />

    <div class="flex justify-between">
      <VcCheckbox v-model="rememberMe" :disabled="loading">
        {{ $t("shared.account.sign_in_form.remember_me_label") }}
      </VcCheckbox>

      <router-link
        v-t="'shared.account.sign_in_form.forgot_password_link'"
        to="/forgot-password"
        class="text-sm font-semibold text-blue-700 hover:text-blue-500"
      />
    </div>

    <!-- Form actions -->
    <div class="mt-8 flex" :class="{ 'max-w-sm': !props.growButtons }">
      <VcButton :loading="loading" type="submit" class="flex-1 shrink">
        {{ $t("shared.account.sign_in_form.login_button") }}
      </VcButton>

      <VcButton :to="{ name: 'SignUp' }" :disabled="loading" variant="outline" class="ml-4 flex-1">
        {{ $t("shared.account.sign_in_form.registration_button") }}
      </VcButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useField, useForm } from "vee-validate";
import { ref, toRef, watch } from "vue";
import { object, string } from "yup";
import { useErrorsTranslator } from "@/core/composables";
import { IdentityErrors } from "@/core/enums";
import { useSignMeIn } from "@/shared/account/composables";
import { ContactAdministratorLink } from "@/shared/common";

const props = withDefaults(defineProps<{ growButtons?: boolean }>(), { growButtons: false });

const schema = toTypedSchema(
  object({
    email: string().required().email(),
    password: string().required(),
  }),
);

const {
  errors: validationErrors,
  meta,
  handleSubmit,
} = useForm({
  validationSchema: schema,
});

const { value: email } = useField<string>("email");
const { value: password } = useField<string>("password");

const rememberMe = ref(false);

const model = toRef({ email, password, rememberMe });

const { errors, loading, signIn, reset } = useSignMeIn(model);

const { translatedErrors } = useErrorsTranslator("shared.account.sign_in_form.errors", errors);

const onSubmit = handleSubmit(async () => {
  await signIn();
});

watch(meta, (value) => {
  if (value.touched) {
    reset();
  }
});
</script>
