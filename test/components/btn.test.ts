import { shallowMount } from '@vue/test-utils';
import { describe, expect, test } from "vitest";
import { VBtn } from '../../src';

describe("button component", () => {
  test("basic", () => {
    const wrapper = shallowMount(VBtn, {});
    expect(wrapper.find('button').text()).toBe("button")
  })
});