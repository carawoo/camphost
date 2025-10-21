#!/bin/bash

# GitHub 레포지토리 생성 및 푸시 스크립트

echo "🔐 GitHub 로그인 시작..."
gh auth login -w

echo "📦 GitHub 레포지토리 생성..."
gh repo create odoichon-b2b --public --source=. --remote=origin --push

echo "✅ 완료!"
echo ""
echo "🌐 GitHub 레포지토리: $(gh repo view --json url -q .url)"
echo ""
echo "다음 단계:"
echo "1. https://vercel.com 접속"
echo "2. 'Add New' → 'Project' 클릭"
echo "3. GitHub 레포지토리 'odoichon-b2b' 선택"
echo "4. 'Deploy' 클릭"
echo "5. Settings → Domains에서 'camphost.real-e.space' 추가"

