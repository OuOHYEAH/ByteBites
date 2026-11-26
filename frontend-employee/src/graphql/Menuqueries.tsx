import { gql } from "@apollo/client";

export const GET_MENU_ITEMS = gql`
  query GetAllMenuItems {
    getAllMenuItems {
      id
      name
      description
      price
      discounted_price
      category
      discount
      availability_status
      image_url
      created_at
      updated_at
    }
  }
`;

export const GET_MENU_ITEM_BY_ID = gql`
  query GetMenuItemById($id: ID!) {
    getMenuItemById(id: $id) {
      id
      name
      description
      price
      discounted_price
      category
      discount
      availability_status
      image_url
      created_at
      updated_at
    }
  }
`;

export const ADD_MENU_ITEM = gql`
  mutation CreateMenuItem($input: NewMenuItem!) {
    createMenuItem(input: $input) {
      name
    }
  }
`;

export const UPDATE_MENU_ITEM = gql`
  mutation UpdateMenuItem($id: ID!, $input: UpdateMenuItem!) {
    updateMenuItem(id: $id, input: $input) {
      id
      name
      description
      price
      discounted_price
      category
      discount
      availability_status
      image_url
      created_at
      updated_at
    }
  }
`;

export const DELETE_MENU_ITEM = gql`
  mutation DeleteMenuItem($id: ID!) {
    deleteMenuItem(id: $id)
  }
`;

export const MENU_ITEM_CREATED = gql`
  subscription {
    menuItemCreated {
      id
      name
      description
      price
      discounted_price
      category
      discount
      availability_status
      image_url
      created_at
    }
  }
`;
