import type { Schema, Struct } from '@strapi/strapi';

export interface MenuIngredient extends Struct.ComponentSchema {
  collectionName: 'components_menu_ingredients';
  info: {
    description: 'One line of the Ingredients list on a dish page.';
    displayName: 'Ingredient';
    icon: 'bulletList';
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'menu.ingredient': MenuIngredient;
    }
  }
}
