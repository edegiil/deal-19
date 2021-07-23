import Component from '../../../core/component.js';

import _ from '../../../utils/dom.js';
import request from '../../../utils/fetchWrapper.js';

import Slider from '../../../components/slider/slider.js';
import Register from '../register/index.js';

import { SIGN_IN_ENDPOINT } from '../../../configs/endpoints.js';

import './style.scss';

export default class Login extends Component {
  initState () {
    this.state = {
      errorMessage: '',
      id: '',
      sliderState: 'none'
    };
  }

  getTemplate () {
    const { errorMessage, id } = this.state;

    return `
      <div id="login__slider"></div>
      <div class="login__content">
        <h2>우아마켓</h2>
        <div class="input-box">
          <input class="input large" id="id-input" value="${id}" />
          ${
            errorMessage
            ? `<div class="error-message">${errorMessage}</div>`
            : ''
          }
        </div>
        <button class="btn large" id="signin-submit">로그인</button>
        <button class="text-btn" id="register">회원가입</button>
      </div>
    `;
  }

  mountChildren () {
    const { sliderState } = this.state;
    const { signIn } = this.props;

    if (sliderState === 'none') {
      return;
    }

    const $slider = _.$('#login__slider');
    new Slider($slider, {
      sliderState,
      Constructor: Register,
      innerProps: {
        closeSlider: this.closeSlider.bind(this),
        title: '회원가입',
        signIn
      }
    });
  }

  setEventListener () {
    this.addEventListener('click', '#signin-submit', this.handleSubmit.bind(this));
    this.addEventListener('click', '#register', this.openSlider.bind(this));
    this.addEventListener('animationend', '#login__slider', () => {
      const { sliderState } = this.state;
      if (sliderState === 'close') {
        this.removeSlider();
      }
    });
  }

  // custom method
  handleSubmit () {
    const id = _.$('#id-input').value;

    const regex = /^(?=.*[a-zA-z])(?=.*[0-9]).{3,20}$/;

    if (!regex.test(id)) {
      this.setState({ errorMessage: '아이디의 형식이 올바르지 않습니다.', id });
      return;
    }

    const $button = _.$('#signin-submit');
    $button.setAttribute('disabled', true);

    requestSignIn.call(this, id);
  }

  openSlider () {
    this.setState({ sliderState: 'open' });
  }

  closeSlider () {
    this.setState({ sliderState: 'close' });
  }
}

function requestSignIn (id) {
  const { signIn } = this.props;

  const $button = _.$('#signin-submit');

  request(SIGN_IN_ENDPOINT, 'POST', {
    body: JSON.stringify({ id }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((result) => {
      const { accessToken, id } = result;
      window.localStorage.setItem('_at', accessToken);
      signIn(id);
    })
    .catch((err) => {
      this.setState({ errorMessage: err, id });
    })
    .finally(() => {
      $button.removeAttribute('disabled');
    });
}
