import Component from '../../core/component.js';
import _ from '../../utils/dom.js';
import './style.scss';
import Header from '../../components/header.js';
import Modal from '../../components/modal.js';
import request from '../../utils/fetchWrapper.js';
import { TOWN_ENDPOINT } from '../../configs/endpoints.js';
const $root = document.querySelector('#root');

export default class App extends Component {
  initState () {
    this.state = {
      isOpenModal: false,
      townList: [{ id: '1', name: '방이동', isActive: true }]
    };
  }

  getTemplate () {
    const { isOpenModal, townList } = this.state;
    console.log(townList);
    return `
      <div id="town__header"></div>
      <div id="town__contents">
        <p>지역은 최소 1개 이상 <br/>
        최대 2개까지 설정 가능해요.</p>
        <ul id="town__town-buttons">
          ${townList
            .map(
              ({ id, name, isActive }) =>
                `<li class="btn small location ${isActive ? 'active' : ''}" data-id=${id}>
                  <div>${name}</div>
                  <div class="wmi-close"></div>
                </li>`
            )
            .join('')}
          ${
            townList.length < 2
              ? '<li class="btn small location adder wmi-add"></li>'
              : ''
          }
        </ul>
      </div>
      ${isOpenModal ? '<div id="town__modal"></div>' : ''}
    `;
  }

  mountChildren () {
    const { registerTown } = this;
    const { isOpenModal } = this.state;

    const $header = _.$('#town__header');

    new Header($header, { title: '내 동네 설정하기' });

    if (isOpenModal) {
      const $modal = _.$('#town__modal');
      new Modal($modal, { type: 'prompt', text: '우리 동네를 입력하세요', placeholder: '시.구 제외, 동만 입력', action: registerTown.bind(this) });
    }
  }

  // active된거 본체 누를때 / active 된거 x 누를 때 / not active 누를 때  / + 누를 때
  setEventListener () {
    this.addEventListener('click', '.btn.location', (e) => {
      const classList = e.target.classList;
      if (classList.contains('wmi-close') || classList.contains('active')) {
        return;
      }

      if (classList.contains('adder')) {
        console.log('open modal');
        this.setState({ isOpenModal: true });
        return;
      }
      console.log('이 동네로 메인 변경');
      // 동네 변경
    });
    this.addEventListener('click', '.btn.location.active > .wmi-close', (e) => {
      console.log('엑스');
      // 이 동네 지우기 요청

      // 지우고 난 후에 동네가 0개라면 동네 추가 모달 띄우기

      // 지워도 하나 남아있다면 그 동네를 메인으로 바꾸기
    });
  }

  registerTown (townName) {
    const $button = _.$('#modal-confirm');
    $button.setAttribute('disabled', true);
    const accessToken = localStorage.getItem('accessToken');
    const { townList } = this.state;
    request(TOWN_ENDPOINT, 'POST', {
      body: JSON.stringify({
        townName, isActive: !townList.length
      }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }).then((result) => {
      const { id, name } = result;
      this.setState({ townList: [...townList, { id, name }] });
    }).catch((err) => {
      this.setState({ errorMessage: err });
    }).finally(() => {
      this.setState({ isOpenModal: false });
    });
    // 이 동네를 유저의 메인 동네 isActive로 등록 요청하고 id, town이름을 응답 받음(id를 서버가 생성하기에)
    //

    // 현재 메인 동네가 없으면 이 동네를 메인으로 등록 (서버와는 별개)
  }

  didMount () {}
}

new App($root);
