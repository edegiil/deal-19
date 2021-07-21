import Component from '../../../core/component.js';
import _ from '../../../utils/dom.js';
import request from '../../../utils/fetchWrapper.js';

import Header from '../../../components/header.js';
import TabBar from '../tabBar/index.js';
import List from '../../../components/list.js';

import { ITEMS_ENDPOINT } from '../../../configs/endpoints.js';

import './style.scss';

export default class Menu extends Component {
  initState () {
    this.state = {
      tab: 'sell',
      productList: []
    };

    const token = window.localStorage.getItem('accessToken');
    request(`${ITEMS_ENDPOINT}?type=sale`, 'GET', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((result) => {
        const { productList } = result;
        this.setState({ productList });
      });
  }

  getTemplate () {
    return `
      <div id="menu__header"></div>
      <div id="menu__tabbar"></div>
      <main class="menu__content"></main>
    `;
  }

  mountChildren () {
    const { tab, productList } = this.state;
    const { closeSlider } = this.props;

    const $header = _.$('#menu__header');
    const $tabbar = _.$('#menu__tabbar');
    const $main = _.$('.menu__content');

    new Header($header, { title: '메뉴', closeSlider });
    new TabBar($tabbar, {
      current: tab,
      tabList: [
        {
          id: 'sell',
          label: '판매목록',
          action: this.changeTab('sell')
        },
        {
          id: 'like',
          label: '관심목록',
          action: this.changeTab('like')
        }
      ]
    });

    new List($main, { productList });
  }

  setEventListener () {

  }

  // Custom Method
  changeTab (tab) {
    return () => {
      this.setState({ tab });
      const API_ENDPOINT = tab === 'sell'
        ? `${ITEMS_ENDPOINT}?type=sale`
        : `${ITEMS_ENDPOINT}?type=liked`;

      const token = window.localStorage.getItem('accessToken');
      request(API_ENDPOINT, 'GET', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then((result) => {
          const { productList } = result;
          this.setState({ productList });
        });
    };
  }
}
