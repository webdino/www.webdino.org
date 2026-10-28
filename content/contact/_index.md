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
  - name: name
    label: お名前
    placeholder: '例: 台野 太郎'
    type: text
    required: true
  - name: company
    label: 会社名
    placeholder: '例: 株式会社 台野'
    type: text
    required: false
  - name: email
    label: メールアドレス
    placeholder: '例: taro@webdino.org'
    type: email
    required: true
  - name: subject
    label: 件名
    placeholder: '例: ブラウザーの導入について'
    type: text
    required: true
  - name: message
    label: 内容
    placeholder: (お問い合わせ内容を教えてください)
    type: multiline
    required: true
submit:
  privacy: '[プライバシーポリシー](/privacy/) に同意します'
  buttonlabel: 送信
thanks:
  heading: お問い合わせありがとうございます
  subheading: Thank You
  description: 担当者より追ってご連絡いたします。<br>問い合わせ内容によっては、お返事を差し上げるまでにお時間をいただく場合がございます。
error:
  heading: 申し訳ありません
  subheading: We Are Sorry
  description: フォームの送信中に問題が発生しました。お手数ですが、また後でお試しください。
---
