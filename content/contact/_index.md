---
type: contact
layout: index
menu:
  secondary:
    identifier: contact
weight: 5
title: お問い合わせ
linktitle: お問い合わせ
subtitle: Contact Us
description: WebDINO Japan の各種事業等に関するお問い合わせ・ご相談は、以下フォームよりお願いいたします。
fields:
  - label: お名前
    name: name
    placeholder: '例: 台野 太郎'
    required: true
    type: text
  - label: 会社名
    name: company
    placeholder: '例: 株式会社 台野'
    required: false
    type: text
  - label: メールアドレス
    name: email
    placeholder: '例: taro@webdino.org'
    required: true
    type: email
  - label: 件名
    name: subject
    placeholder: '例: ブラウザーの導入について'
    required: true
    type: text
  - label: 内容
    name: message
    placeholder: (お問い合わせ内容を教えてください)
    required: true
    type: multiline
submit:
  buttonlabel: 送信
  privacy: '[プライバシーポリシー](/privacy/) に同意します'
thanks:
  heading: お問い合わせありがとうございます
  subheading: Thank You
  description: 担当者より追ってご連絡いたします。<br>問い合わせ内容によっては、お返事を差し上げるまでにお時間をいただく場合がございます。
error:
  heading: 申し訳ありません
  subheading: We Are Sorry
  description: フォームの送信中に問題が発生しました。お手数ですが、また後でお試しください。
---
